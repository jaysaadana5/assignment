from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
import re
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class SiteData(BaseModel):
    model_config = ConfigDict(extra="allow")
    heroBadge: Optional[str] = ""
    heroDuration: Optional[str] = ""
    heroDescription: Optional[str] = ""
    heroContributors: Optional[str] = ""
    heroProjects: Optional[str] = ""
    heroPRs: Optional[str] = ""
    aboutMonths: Optional[str] = ""
    timelineRegStart: Optional[str] = ""
    timelineRegEnd: Optional[str] = ""
    timelineCodingStart: Optional[str] = ""
    timelineCodingEnd: Optional[str] = ""
    timelineResult: Optional[str] = ""
    statContributors: Optional[str] = ""
    statPRs: Optional[str] = ""
    statProjects: Optional[str] = ""
    statCountries: Optional[str] = ""
    statOrgs: Optional[str] = ""

class ApplyLinks(BaseModel):
    contributorLink: Optional[str] = ""
    mentorLink: Optional[str] = ""
    projectAdminLink: Optional[str] = ""

class FormStatus(BaseModel):
    contributor: bool = True  # Is contributor form open?
    mentor: bool = True  # Is mentor form open?
    projectAdmin: bool = True  # Is project admin form open?

class FooterLink(BaseModel):
    label: str
    url: str

class ContentPage(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str  # URL-friendly identifier (e.g., "code-of-conduct")
    title: str
    content: str  # HTML content
    category: str = "legal"  # legal, resource, community
    isPublished: bool = True
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FooterData(BaseModel):
    model_config = ConfigDict(extra="allow")
    brandDescription: Optional[str] = "India's largest open source program connecting students, mentors, and organizations to build amazing things together."
    socialLinks: Dict[str, str] = {}  # {github: url, twitter: url, linkedin: url, instagram: url, discord: url}
    programLinks: List[FooterLink] = []
    resourceLinks: List[FooterLink] = []
    communityLinks: List[FooterLink] = []
    legalLinks: List[FooterLink] = []
    copyrightText: Optional[str] = "© 2025 Social Summer of Code. All rights reserved."

class CustomField(BaseModel):
    id: str
    label: str
    type: str
    placeholder: Optional[str] = ""
    required: bool = False
    options: List[str] = []

class Project(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    organization: Optional[str] = ""
    description: Optional[str] = ""
    tags: List[str] = []
    github: Optional[str] = ""
    website: Optional[str] = ""
    logo: Optional[str] = ""
    stars: int = 0
    forks: int = 0
    contributors: int = 0

class Mentor(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: Optional[str] = ""
    company: Optional[str] = ""
    bio: Optional[str] = ""
    skills: List[str] = []
    avatar: Optional[str] = ""
    github: Optional[str] = ""
    linkedin: Optional[str] = ""
    twitter: Optional[str] = ""

class Organizer(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str  # Position/Role in SSOC
    photo: Optional[str] = ""
    bio: Optional[str] = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    twitter: Optional[str] = ""
    portfolio: Optional[str] = ""
    topmateLink: Optional[str] = ""  # For "Schedule Free Call" CTA
    isActive: bool = True

class CampusAdvocate(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    college: str  # College/University name
    city: str  # City
    photo: Optional[str] = ""
    bio: Optional[str] = ""
    linkedin: Optional[str] = ""
    instagram: Optional[str] = ""
    twitter: Optional[str] = ""
    isActive: bool = True

class AdvocateApplication(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = ""
    college: str
    city: str
    year: str  # Year of study
    branch: Optional[str] = ""  # Branch/Department
    linkedin: Optional[str] = ""
    why_advocate: str  # Why do you want to be a campus advocate?
    experience: Optional[str] = ""  # Any relevant experience
    ideas: Optional[str] = ""  # Ideas for promoting SSoC
    status: str = "pending"  # pending, approved, rejected
    published: bool = False  # Whether this application has been published to Campus Advocates
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ReferralLink(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str  # Unique referral code (e.g., "ananya-singh", "tech-fest-2025")
    name: str  # Display name for the link
    type: str  # "advocate" or "custom"
    advocateId: Optional[str] = None  # If type is advocate, link to the advocate
    advocateName: Optional[str] = None  # Advocate name for display
    clicks: int = 0  # Number of clicks
    registrations: int = 0  # Number of registrations from this link
    isActive: bool = True
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Sponsor(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    logo: str  # Logo URL
    website: str  # Backlink URL
    category: str  # platinum, gold, silver, bronze, community
    isActive: bool = True

class Testimonial(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: Optional[str] = ""
    quote: str
    image: Optional[str] = ""
    achievement: Optional[str] = ""

class FAQ(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str

class Registration(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    role: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class GalleryBadgeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    github: str = Field(..., min_length=1, max_length=39)
    role: str = Field(..., pattern=r"^(contributor|mentor|admin)$")
    tagline: Optional[str] = Field(default="", max_length=140)

class GalleryBadge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    github: str
    role: str
    tagline: Optional[str] = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ============ SITE DATA ROUTES ============

@api_router.get("/site-data")
async def get_site_data():
    data = await db.site_data.find_one({"_id": "main"}, {"_id": 0})
    return data or {}

@api_router.post("/site-data")
async def save_site_data(data: SiteData):
    await db.site_data.update_one(
        {"_id": "main"},
        {"$set": data.model_dump()},
        upsert=True
    )
    await update_section_timestamp("siteData")
    return {"success": True, "message": "Site data saved"}

# ============ APPLY LINKS ROUTES ============

@api_router.get("/apply-links")
async def get_apply_links():
    data = await db.apply_links.find_one({"_id": "main"}, {"_id": 0})
    return data or {}

@api_router.post("/apply-links")
async def save_apply_links(data: ApplyLinks):
    await db.apply_links.update_one(
        {"_id": "main"},
        {"$set": data.model_dump()},
        upsert=True
    )
    await update_section_timestamp("applyLinks")
    return {"success": True, "message": "Apply links saved"}

# ============ FORM STATUS ROUTES ============

@api_router.get("/form-status")
async def get_form_status():
    data = await db.form_status.find_one({"_id": "main"}, {"_id": 0})
    return data or {"contributor": True, "mentor": True, "projectAdmin": True}

@api_router.post("/form-status")
async def save_form_status(data: FormStatus):
    await db.form_status.update_one(
        {"_id": "main"},
        {"$set": data.model_dump()},
        upsert=True
    )
    return {"success": True, "message": "Form status saved"}

# ============ SECTION TIMESTAMPS ============

async def update_section_timestamp(section: str):
    """Update the last-modified timestamp for a given admin section."""
    await db.section_timestamps.update_one(
        {"_id": section},
        {"$set": {"updatedAt": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )

@api_router.get("/section-timestamps")
async def get_section_timestamps():
    """Get all section timestamps."""
    timestamps = {}
    async for doc in db.section_timestamps.find():
        timestamps[doc["_id"]] = doc.get("updatedAt")
    return timestamps

# ============ FOOTER ROUTES ============

@api_router.get("/footer")
async def get_footer():
    data = await db.footer.find_one({"_id": "main"}, {"_id": 0})
    if data:
        return data
    # Return default footer data
    return {
        "brandDescription": "India's largest open source program connecting students, mentors, and organizations to build amazing things together.",
        "socialLinks": {
            "github": "#",
            "twitter": "#",
            "linkedin": "#",
            "instagram": "#"
        },
        "programLinks": [
            {"label": "About", "url": "#about"},
            {"label": "Timeline", "url": "#timeline"},
            {"label": "Register", "url": "#register"},
            {"label": "FAQ", "url": "#faq"}
        ],
        "resourceLinks": [
            {"label": "Documentation", "url": "#"},
            {"label": "Projects", "url": "projects.html"},
            {"label": "Leaderboard", "url": "#"},
            {"label": "Blog", "url": "#"}
        ],
        "communityLinks": [
            {"label": "Discord", "url": "#"},
            {"label": "Twitter", "url": "#"},
            {"label": "GitHub", "url": "#"},
            {"label": "LinkedIn", "url": "#"}
        ],
        "legalLinks": [
            {"label": "Privacy Policy", "url": "#"},
            {"label": "Terms of Service", "url": "#"},
            {"label": "Code of Conduct", "url": "#"}
        ],
        "copyrightText": "© 2025 Social Summer of Code. All rights reserved."
    }

@api_router.post("/footer")
async def save_footer(data: FooterData):
    await db.footer.update_one(
        {"_id": "main"},
        {"$set": data.model_dump()},
        upsert=True
    )
    await update_section_timestamp("footer")
    return {"success": True, "message": "Footer data saved"}

# ============ CONTENT PAGES ROUTES ============

@api_router.get("/pages", response_model=List[Dict[str, Any]])
async def get_all_pages():
    """Get all content pages"""
    pages = await db.pages.find({}, {"_id": 0}).to_list(100)
    return pages

@api_router.get("/pages/{slug}")
async def get_page_by_slug(slug: str):
    """Get a single page by its slug"""
    page = await db.pages.find_one({"slug": slug}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

@api_router.post("/pages")
async def create_page(page: ContentPage):
    """Create a new content page"""
    existing = await db.pages.find_one({"slug": page.slug})
    if existing:
        raise HTTPException(status_code=400, detail="A page with this slug already exists")
    await db.pages.insert_one(page.model_dump())
    await update_section_timestamp("pages")
    return {"success": True, "message": "Page created", "id": page.id}

@api_router.put("/pages/{page_id}")
async def update_page(page_id: str, page: ContentPage):
    """Update an existing content page"""
    page_data = page.model_dump()
    page_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    await db.pages.update_one(
        {"id": page_id},
        {"$set": page_data}
    )
    await update_section_timestamp("pages")
    return {"success": True, "message": "Page updated"}

@api_router.delete("/pages/{page_id}")
async def delete_page(page_id: str):
    """Delete a content page"""
    await db.pages.delete_one({"id": page_id})
    await update_section_timestamp("pages")
    return {"success": True, "message": "Page deleted"}

# ============ CUSTOM FIELDS ROUTES ============

@api_router.get("/custom-fields", response_model=List[CustomField])
async def get_custom_fields():
    """Get all custom fields (legacy - returns contributor fields)"""
    fields = await db.custom_fields.find({"role": {"$in": [None, "contributor"]}}, {"_id": 0}).to_list(100)
    return fields

@api_router.get("/custom-fields/{role}")
async def get_custom_fields_by_role(role: str):
    """Get custom fields for a specific role (contributor, mentor, projectadmin)"""
    fields = await db.custom_fields_by_role.find_one({"role": role}, {"_id": 0})
    if fields:
        return fields.get("fields", [])
    return []

@api_router.post("/custom-fields")
async def save_custom_fields(fields: List[CustomField]):
    """Save custom fields (legacy - saves as contributor)"""
    await db.custom_fields.delete_many({})
    if fields:
        await db.custom_fields.insert_many([f.model_dump() for f in fields])
    return {"success": True, "message": "Custom fields saved"}

@api_router.post("/custom-fields/{role}")
async def save_custom_fields_by_role(role: str, fields: List[CustomField]):
    """Save custom fields for a specific role"""
    await db.custom_fields_by_role.update_one(
        {"role": role},
        {"$set": {"role": role, "fields": [f.model_dump() for f in fields]}},
        upsert=True
    )
    await update_section_timestamp("formBuilder")
    return {"success": True, "message": f"Custom fields for {role} saved"}

@api_router.get("/all-custom-fields")
async def get_all_custom_fields():
    """Get all custom fields organized by role"""
    result = {
        "contributor": [],
        "mentor": [],
        "projectadmin": []
    }
    async for doc in db.custom_fields_by_role.find({}, {"_id": 0}):
        role = doc.get("role")
        if role in result:
            result[role] = doc.get("fields", [])
    return result

# ============ ORGANIZERS ROUTES ============

@api_router.get("/organizers", response_model=List[Dict[str, Any]])
async def get_organizers():
    """Get all organizers"""
    organizers = await db.organizers.find({}, {"_id": 0}).to_list(100)
    return organizers

@api_router.post("/organizers")
async def save_organizers(organizers: List[Organizer]):
    """DEPRECATED: Use /organizers/add to add individual organizers."""
    if not organizers or len(organizers) == 0:
        return {"success": False, "message": "Cannot save empty list."}
    
    added_count = 0
    for organizer in organizers:
        existing = await db.organizers.find_one({"id": organizer.id})
        if not existing:
            await db.organizers.insert_one(organizer.model_dump())
            added_count += 1
    
    return {"success": True, "message": f"Added {added_count} new organizers (existing ones preserved)"}

@api_router.post("/organizers/add")
async def add_organizer(organizer: Organizer):
    """Add a single organizer"""
    await db.organizers.insert_one(organizer.model_dump())
    await update_section_timestamp("organizers")
    return {"success": True, "message": "Organizer added", "id": organizer.id}

@api_router.put("/organizers/{organizer_id}")
async def update_organizer(organizer_id: str, organizer: Organizer):
    """Update an organizer"""
    await db.organizers.update_one(
        {"id": organizer_id},
        {"$set": organizer.model_dump()}
    )
    await update_section_timestamp("organizers")
    return {"success": True, "message": "Organizer updated"}

@api_router.delete("/organizers/{organizer_id}")
async def delete_organizer(organizer_id: str):
    """Delete an organizer"""
    await db.organizers.delete_one({"id": organizer_id})
    await update_section_timestamp("organizers")
    return {"success": True, "message": "Organizer deleted"}

# ============ PROJECTS ROUTES ============

@api_router.get("/projects", response_model=List[Dict[str, Any]])
async def get_projects():
    projects = await db.projects.find({}, {"_id": 0}).to_list(1000)
    return projects

@api_router.post("/projects")
async def save_projects(projects: List[Project]):
    """DEPRECATED: Use /projects/add to add individual projects."""
    if not projects or len(projects) == 0:
        return {"success": False, "message": "Cannot save empty list."}
    
    added_count = 0
    for project in projects:
        existing = await db.projects.find_one({"id": project.id})
        if not existing:
            await db.projects.insert_one(project.model_dump())
            added_count += 1
    
    return {"success": True, "message": f"Added {added_count} new projects (existing ones preserved)"}

@api_router.post("/projects/add")
async def add_project(project: Project):
    await db.projects.insert_one(project.model_dump())
    await update_section_timestamp("projects")
    return {"success": True, "message": "Project added"}

@api_router.put("/projects/{project_id}")
async def update_project(project_id: str, project: Project):
    data = project.model_dump()
    data["id"] = project_id  # ensure id stays consistent
    result = await db.projects.update_one({"id": project_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    await update_section_timestamp("projects")
    return {"success": True, "message": "Project updated"}

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    await db.projects.delete_one({"id": project_id})
    await update_section_timestamp("projects")
    return {"success": True, "message": "Project deleted"}

# ============ CAMPUS ADVOCATES ROUTES ============

@api_router.get("/campus-advocates", response_model=List[Dict[str, Any]])
async def get_campus_advocates():
    """Get campus advocates (excludes large photo blobs for performance)"""
    advocates = await db.campus_advocates.find({}, {"_id": 0, "photo": 0}).sort("name", 1).to_list(200)
    return advocates

@api_router.get("/campus-advocates/active", response_model=List[Dict[str, Any]])
async def get_active_campus_advocates():
    """Get only active campus advocates (optimized - excludes large photo blobs)"""
    advocates = await db.campus_advocates.find(
        {"isActive": {"$ne": False}},
        {"_id": 0, "photo": 0}
    ).to_list(200)
    return advocates
    return advocates

@api_router.post("/campus-advocates")
async def save_campus_advocates(advocates: List[CampusAdvocate]):
    """
    DEPRECATED: Bulk save campus advocates.
    This endpoint is kept for backward compatibility but should not be used.
    Use /campus-advocates/add to add individual advocates.
    Use /campus-advocates/{id} with PUT to update.
    """
    # Safety check: Don't allow empty list to delete all records
    if not advocates or len(advocates) == 0:
        return {"success": False, "message": "Cannot save empty list. Use DELETE endpoint to remove individual advocates."}
    
    # Instead of replacing all, just add new ones that don't exist
    added_count = 0
    for advocate in advocates:
        existing = await db.campus_advocates.find_one({"id": advocate.id})
        if not existing:
            await db.campus_advocates.insert_one(advocate.model_dump())
            added_count += 1
    
    return {"success": True, "message": f"Added {added_count} new advocates (existing ones preserved)"}

@api_router.post("/campus-advocates/add")
async def add_campus_advocate(advocate: CampusAdvocate):
    """Add a single campus advocate"""
    await db.campus_advocates.insert_one(advocate.model_dump())
    await update_section_timestamp("advocates")
    return {"success": True, "message": "Campus advocate added", "id": advocate.id}

@api_router.put("/campus-advocates/{advocate_id}")
async def update_campus_advocate(advocate_id: str, advocate: CampusAdvocate):
    """Update a campus advocate"""
    await db.campus_advocates.update_one(
        {"id": advocate_id},
        {"$set": advocate.model_dump()}
    )
    await update_section_timestamp("advocates")
    return {"success": True, "message": "Campus advocate updated"}

@api_router.delete("/campus-advocates/{advocate_id}")
async def delete_campus_advocate(advocate_id: str):
    """Delete a campus advocate"""
    await db.campus_advocates.delete_one({"id": advocate_id})
    await update_section_timestamp("advocates")
    return {"success": True, "message": "Campus advocate deleted"}

# ============ ADVOCATE APPLICATIONS ROUTES ============

@api_router.get("/advocate-applications", response_model=List[Dict[str, Any]])
async def get_advocate_applications():
    """Get all advocate applications"""
    applications = await db.advocate_applications.find({}, {"_id": 0}).to_list(1000)
    return applications

@api_router.post("/advocate-applications/apply")
async def submit_advocate_application(application: AdvocateApplication):
    """Submit a new advocate application"""
    # Check if email already applied
    escaped_email = re.escape(application.email)
    existing = await db.advocate_applications.find_one(
        {"email": {"$regex": f"^{escaped_email}$", "$options": "i"}}
    )
    if existing:
        return {
            "success": False,
            "message": "You have already submitted an application with this email."
        }
    
    await db.advocate_applications.insert_one(application.model_dump())
    return {"success": True, "message": "Application submitted successfully! We'll review and get back to you soon."}

@api_router.put("/advocate-applications/{app_id}/status")
async def update_application_status(app_id: str, status: str):
    """Update application status (pending, approved, rejected)"""
    if status not in ["pending", "approved", "rejected"]:
        return {"success": False, "message": "Invalid status"}
    
    await db.advocate_applications.update_one(
        {"id": app_id},
        {"$set": {"status": status}}
    )
    return {"success": True, "message": f"Application {status}"}

@api_router.post("/advocate-applications/{app_id}/publish")
async def publish_advocate_application(app_id: str, force: bool = False):
    """Publish an approved application to Campus Advocates. Use force=true to republish."""
    # Get the application
    app = await db.advocate_applications.find_one({"id": app_id}, {"_id": 0})
    if not app:
        return {"success": False, "message": "Application not found"}
    
    if app.get("status") != "approved":
        return {"success": False, "message": "Only approved applications can be published"}
    
    # Check if already published (unless force republish)
    if app.get("published") and not force:
        return {"success": False, "message": "This application has already been published. Use republish to publish again."}
    
    # Create advocate from application
    advocate = CampusAdvocate(
        name=app["name"],
        college=app["college"],
        city=app["city"],
        photo="",
        bio=app.get("why_advocate", "")[:150] if app.get("why_advocate") else "",
        linkedin=app.get("linkedin", ""),
        instagram="",
        twitter="",
        isActive=True
    )
    
    # Add to campus advocates
    adv_data = advocate.model_dump()
    adv_data.pop("_id", None)
    await db.campus_advocates.insert_one(adv_data)
    
    # Mark application as published
    await db.advocate_applications.update_one(
        {"id": app_id},
        {"$set": {"published": True}}
    )
    
    action = "republished" if force else "published"
    return {
        "success": True, 
        "message": f"{app['name']} has been {action} to Campus Advocates!",
        "advocate_id": advocate.id
    }

@api_router.post("/advocate-applications/republish-all")
async def republish_all_advocates():
    """Bulk republish all approved applications to Campus Advocates."""
    try:
        approved_apps = await db.advocate_applications.find(
            {"status": "approved"},
            {"_id": 0}
        ).to_list(500)
        
        if not approved_apps:
            return {"success": False, "message": "No approved applications found"}
        
        created = 0
        skipped = 0
        for app in approved_apps:
            # Check if advocate already exists by email to avoid duplicates
            existing = await db.campus_advocates.find_one({"name": app["name"], "college": app["college"]})
            if existing:
                skipped += 1
                continue
            
            advocate = CampusAdvocate(
                name=app["name"],
                college=app["college"],
                city=app["city"],
                photo="",
                bio=app.get("why_advocate", "")[:150] if app.get("why_advocate") else "",
                linkedin=app.get("linkedin", ""),
                instagram="",
                twitter="",
                isActive=True
            )
            adv_data = advocate.model_dump()
            adv_data.pop("_id", None)
            await db.campus_advocates.insert_one(adv_data)
            
            # Mark as published
            await db.advocate_applications.update_one(
                {"id": app["id"]},
                {"$set": {"published": True}}
            )
            created += 1
        
        return {
            "success": True,
            "message": f"Republished {created} advocates ({skipped} already existed)",
            "created": created,
            "skipped": skipped
        }
    except Exception as e:
        return {"success": False, "message": f"Error: {str(e)}"}

@api_router.delete("/advocate-applications/{app_id}")
async def delete_advocate_application(app_id: str):
    """Delete an advocate application"""
    await db.advocate_applications.delete_one({"id": app_id})
    return {"success": True, "message": "Application deleted"}

# ============ MENTORS ROUTES ============

@api_router.get("/mentors", response_model=List[Dict[str, Any]])
async def get_mentors():
    mentors = await db.mentors.find({}, {"_id": 0}).to_list(1000)
    return mentors

@api_router.post("/mentors")
async def save_mentors(mentors: List[Mentor]):
    """DEPRECATED: Use /mentors/add to add individual mentors."""
    if not mentors or len(mentors) == 0:
        return {"success": False, "message": "Cannot save empty list."}
    
    added_count = 0
    for mentor in mentors:
        existing = await db.mentors.find_one({"id": mentor.id})
        if not existing:
            await db.mentors.insert_one(mentor.model_dump())
            added_count += 1
    
    return {"success": True, "message": f"Added {added_count} new mentors (existing ones preserved)"}

@api_router.post("/mentors/add")
async def add_mentor(mentor: Mentor):
    await db.mentors.insert_one(mentor.model_dump())
    await update_section_timestamp("mentors")
    return {"success": True, "message": "Mentor added"}

@api_router.delete("/mentors/{mentor_id}")
async def delete_mentor(mentor_id: str):
    await db.mentors.delete_one({"id": mentor_id})
    await update_section_timestamp("mentors")
    return {"success": True, "message": "Mentor deleted"}

# ============ SPONSORS ROUTES ============

@api_router.get("/sponsors", response_model=List[Dict[str, Any]])
async def get_sponsors():
    """Get all sponsors"""
    sponsors = await db.sponsors.find({}, {"_id": 0}).to_list(500)
    return sponsors

@api_router.post("/sponsors")
async def save_sponsors(sponsors: List[Sponsor]):
    """
    DEPRECATED: Bulk save sponsors.
    Use /sponsors/add to add individual sponsors.
    Use /sponsors/{id} with PUT to update.
    """
    if not sponsors or len(sponsors) == 0:
        return {"success": False, "message": "Cannot save empty list. Use DELETE endpoint to remove individual sponsors."}
    
    added_count = 0
    for sponsor in sponsors:
        existing = await db.sponsors.find_one({"id": sponsor.id})
        if not existing:
            await db.sponsors.insert_one(sponsor.model_dump())
            added_count += 1
    
    return {"success": True, "message": f"Added {added_count} new sponsors (existing ones preserved)"}

@api_router.post("/sponsors/add")
async def add_sponsor(sponsor: Sponsor):
    """Add a single sponsor"""
    await db.sponsors.insert_one(sponsor.model_dump())
    await update_section_timestamp("sponsors")
    return {"success": True, "message": "Sponsor added", "id": sponsor.id}

@api_router.put("/sponsors/{sponsor_id}")
async def update_sponsor(sponsor_id: str, sponsor: Sponsor):
    """Update a sponsor"""
    sponsor_data = sponsor.model_dump()
    sponsor_data["id"] = sponsor_id  # Preserve original ID
    await db.sponsors.update_one(
        {"id": sponsor_id},
        {"$set": sponsor_data}
    )
    await update_section_timestamp("sponsors")
    return {"success": True, "message": "Sponsor updated"}

@api_router.delete("/sponsors/{sponsor_id}")
async def delete_sponsor(sponsor_id: str):
    """Delete a sponsor"""
    await db.sponsors.delete_one({"id": sponsor_id})
    await update_section_timestamp("sponsors")
    return {"success": True, "message": "Sponsor deleted"}

# ============ TESTIMONIALS ROUTES ============

@api_router.get("/testimonials", response_model=List[Dict[str, Any]])
async def get_testimonials():
    testimonials = await db.testimonials.find({}, {"_id": 0}).to_list(1000)
    return testimonials

@api_router.post("/testimonials")
async def save_testimonials(testimonials: List[Testimonial]):
    """DEPRECATED: Use /testimonials/add to add individual testimonials."""
    if not testimonials or len(testimonials) == 0:
        return {"success": False, "message": "Cannot save empty list."}
    
    added_count = 0
    for testimonial in testimonials:
        existing = await db.testimonials.find_one({"id": testimonial.id})
        if not existing:
            await db.testimonials.insert_one(testimonial.model_dump())
            added_count += 1
    
    return {"success": True, "message": f"Added {added_count} new testimonials (existing ones preserved)"}

@api_router.post("/testimonials/add")
async def add_testimonial(testimonial: Testimonial):
    await db.testimonials.insert_one(testimonial.model_dump())
    await update_section_timestamp("testimonials")
    return {"success": True, "message": "Testimonial added"}

@api_router.delete("/testimonials/{testimonial_id}")
async def delete_testimonial(testimonial_id: str):
    await db.testimonials.delete_one({"id": testimonial_id})
    await update_section_timestamp("testimonials")
    return {"success": True, "message": "Testimonial deleted"}

# ============ FAQ ROUTES ============

@api_router.get("/faqs", response_model=List[Dict[str, Any]])
async def get_faqs():
    faqs = await db.faqs.find({}, {"_id": 0}).to_list(1000)
    return faqs

@api_router.post("/faqs")
async def save_faqs(faqs: List[FAQ]):
    """DEPRECATED: Use /faqs/add to add individual FAQs."""
    if not faqs or len(faqs) == 0:
        return {"success": False, "message": "Cannot save empty list."}
    
    added_count = 0
    for faq in faqs:
        existing = await db.faqs.find_one({"id": faq.id})
        if not existing:
            await db.faqs.insert_one(faq.model_dump())
            added_count += 1
    
    return {"success": True, "message": f"Added {added_count} new FAQs (existing ones preserved)"}

@api_router.post("/faqs/add")
async def add_faq(faq: FAQ):
    await db.faqs.insert_one(faq.model_dump())
    return {"success": True, "message": "FAQ added"}

@api_router.delete("/faqs/{faq_id}")
async def delete_faq(faq_id: str):
    await db.faqs.delete_one({"id": faq_id})
    return {"success": True, "message": "FAQ deleted"}

# ============ REGISTRATIONS ROUTES ============

@api_router.get("/registrations", response_model=List[Dict[str, Any]])
async def get_registrations():
    registrations = await db.registrations.find({}, {"_id": 0}).to_list(10000)
    return registrations

@api_router.get("/registrations/count")
async def get_registration_counts():
    """Get registration counts by role for FOMO display"""
    pipeline = [
        {"$group": {"_id": "$role", "count": {"$sum": 1}}},
    ]
    results = await db.registrations.aggregate(pipeline).to_list(100)
    
    counts = {
        "contributor": 0,
        "mentor": 0,
        "project-admin": 0,
        "total": 0
    }
    
    for r in results:
        role = r.get("_id")
        count = r.get("count", 0)
        if role in counts:
            counts[role] = count
        counts["total"] += count
    
    return counts

@api_router.get("/registrations/check/{email}")
async def check_registration(email: str):
    """Check if email is already registered and for which roles"""
    escaped_email = re.escape(email)
    registrations = await db.registrations.find(
        {"email": {"$regex": f"^{escaped_email}$", "$options": "i"}},
        {"_id": 0, "role": 1, "email": 1, "name": 1}
    ).to_list(100)
    
    roles = [r.get("role") for r in registrations]
    return {
        "exists": len(registrations) > 0,
        "roles": roles,
        "registrations": registrations
    }

@api_router.post("/registrations/add")
async def add_registration(registration: Registration):
    email = registration.email
    new_role = registration.role
    
    # Check for existing registrations with this email
    escaped_email = re.escape(email)
    existing = await db.registrations.find(
        {"email": {"$regex": f"^{escaped_email}$", "$options": "i"}},
        {"_id": 0, "role": 1}
    ).to_list(100)
    
    existing_roles = [r.get("role") for r in existing]
    
    # Check if already registered for same role
    if new_role in existing_roles:
        return {
            "success": False, 
            "message": f"You have already registered as {new_role.replace('-', ' ').title()}. Duplicate registration not allowed.",
            "error_type": "duplicate_role"
        }
    
    # Check if contributor trying to apply as mentor/project-admin
    if "contributor" in existing_roles and new_role in ["mentor", "project-admin"]:
        return {
            "success": False,
            "message": "Contributors cannot apply as Mentors or Project Admins. Please use a different email if you want to apply for a different role.",
            "error_type": "role_restriction"
        }
    
    # Check if mentor/project-admin trying to apply as contributor
    if new_role == "contributor" and any(r in existing_roles for r in ["mentor", "project-admin"]):
        return {
            "success": False,
            "message": "Mentors and Project Admins cannot apply as Contributors. Please use a different email if you want to apply as a Contributor.",
            "error_type": "role_restriction"
        }
    
    # All validations passed - add registration
    await db.registrations.insert_one(registration.model_dump())
    return {"success": True, "message": "Registration added successfully!"}

# ============ ADVOCATE TASKS & LEADERBOARD ============

class AdvocateTask(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    points: int = 10
    isActive: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TaskCompletion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str
    advocate_id: str
    completed_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    notes: str = ""

@api_router.get("/advocate-tasks")
async def get_advocate_tasks():
    """Get all advocate tasks"""
    tasks = await db.advocate_tasks.find({}, {"_id": 0}).to_list(1000)
    return tasks

@api_router.post("/advocate-tasks")
async def create_advocate_task(task: AdvocateTask):
    """Create a new advocate task"""
    try:
        task_data = task.model_dump()
        task_id = task_data.get("id")
        # Remove any _id that might exist to avoid conflicts
        task_data.pop("_id", None)
        await db.advocate_tasks.insert_one(task_data)
        await update_section_timestamp("leaderboard")
        return {"success": True, "message": "Task created", "id": task_id}
    except Exception as e:
        return {"success": False, "message": f"Error creating task: {str(e)}"}

@api_router.put("/advocate-tasks/{task_id}")
async def update_advocate_task(task_id: str, task: AdvocateTask):
    """Update an existing advocate task"""
    update_data = task.model_dump()
    update_data.pop("id", None)
    result = await db.advocate_tasks.update_one(
        {"id": task_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    await update_section_timestamp("leaderboard")
    return {"success": True, "message": "Task updated"}

@api_router.delete("/advocate-tasks/{task_id}")
async def delete_advocate_task(task_id: str):
    """Delete an advocate task and its completions"""
    await db.advocate_tasks.delete_one({"id": task_id})
    await db.task_completions.delete_many({"task_id": task_id})
    await update_section_timestamp("leaderboard")
    return {"success": True, "message": "Task deleted"}

@api_router.get("/task-completions")
async def get_task_completions():
    """Get all task completions"""
    completions = await db.task_completions.find({}, {"_id": 0}).to_list(10000)
    return completions

@api_router.post("/task-completions/assign")
async def assign_task(completion: TaskCompletion):
    """Mark a task as completed by an advocate"""
    try:
        existing = await db.task_completions.find_one(
            {"task_id": completion.task_id, "advocate_id": completion.advocate_id}
        )
        if existing:
            return {"success": False, "message": "Task already assigned to this advocate"}
        comp_data = completion.model_dump()
        comp_data.pop("_id", None)
        await db.task_completions.insert_one(comp_data)
        return {"success": True, "message": "Task assigned"}
    except Exception as e:
        return {"success": False, "message": f"Error assigning task: {str(e)}"}

@api_router.post("/task-completions/unassign")
async def unassign_task(data: Dict[str, Any]):
    """Remove a task completion"""
    result = await db.task_completions.delete_one(
        {"task_id": data.get("task_id"), "advocate_id": data.get("advocate_id")}
    )
    if result.deleted_count == 0:
        return {"success": False, "message": "Completion not found"}
    return {"success": True, "message": "Task unassigned"}

@api_router.get("/leaderboard")
async def get_leaderboard():
    """Get public leaderboard — only advocates with scores, not all advocates."""
    # Get tasks and completions in parallel
    tasks, completions = await asyncio.gather(
        db.advocate_tasks.find({"isActive": True}, {"_id": 0}).to_list(1000),
        db.task_completions.find({}, {"_id": 0}).to_list(10000)
    )
    
    task_map = {t["id"]: t for t in tasks}

    # Calculate scores — only track advocates who have completions
    scores = {}
    task_counts = {}
    scored_advocate_ids = set()
    for c in completions:
        aid = c["advocate_id"]
        tid = c["task_id"]
        if tid in task_map:
            points = task_map[tid].get("points", 0)
            scores[aid] = scores.get(aid, 0) + points
            task_counts[aid] = task_counts.get(aid, 0) + 1
            scored_advocate_ids.add(aid)

    # Only fetch advocates who have scores (not all 61MB of them)
    if scored_advocate_ids:
        advocates = await db.campus_advocates.find(
            {"id": {"$in": list(scored_advocate_ids)}, "isActive": True},
            {"_id": 0, "id": 1, "name": 1, "college": 1, "city": 1, "photo": 1, "bio": 1, "linkedin": 1}
        ).to_list(500)
    else:
        advocates = []

    # Also get total active advocate count (lightweight count, not full docs)
    total_advocates = await db.campus_advocates.count_documents({"isActive": True})

    # Build leaderboard
    leaderboard = []
    for adv in advocates:
        aid = adv["id"]
        total_score = scores.get(aid, 0)
        tasks_done = task_counts.get(aid, 0)
        leaderboard.append({
            "id": aid,
            "name": adv.get("name", ""),
            "college": adv.get("college", ""),
            "city": adv.get("city", ""),
            "score": total_score,
            "tasks_completed": tasks_done,
            "total_tasks": len(tasks)
        })

    # Sort by score descending, then by name
    leaderboard.sort(key=lambda x: (-x["score"], x["name"]))

    # Add rank
    for i, entry in enumerate(leaderboard):
        entry["rank"] = i + 1

    return {
        "leaderboard": leaderboard,
        "total_tasks": len(tasks),
        "total_advocates": total_advocates
    }

# ============ REFERRAL LINKS ROUTES ============

@api_router.get("/referral-links", response_model=List[Dict[str, Any]])
async def get_referral_links():
    """Get all referral links"""
    links = await db.referral_links.find({}, {"_id": 0}).to_list(1000)
    return links

@api_router.get("/referral-links/{code}")
async def get_referral_link_by_code(code: str):
    """Get a referral link by its code"""
    link = await db.referral_links.find_one({"code": code}, {"_id": 0})
    if not link:
        raise HTTPException(status_code=404, detail="Referral link not found")
    return link

@api_router.post("/referral-links")
async def create_referral_link(link: ReferralLink):
    """Create a new referral link"""
    # Check if code already exists
    existing = await db.referral_links.find_one({"code": link.code})
    if existing:
        return {"success": False, "message": "A referral link with this code already exists"}
    
    await db.referral_links.insert_one(link.model_dump())
    return {"success": True, "message": "Referral link created", "id": link.id, "code": link.code}

@api_router.put("/referral-links/{link_id}")
async def update_referral_link(link_id: str, link: ReferralLink):
    """Update a referral link"""
    link_data = link.model_dump()
    link_data["id"] = link_id  # Preserve ID
    await db.referral_links.update_one(
        {"id": link_id},
        {"$set": link_data}
    )
    return {"success": True, "message": "Referral link updated"}

@api_router.delete("/referral-links/{link_id}")
async def delete_referral_link(link_id: str):
    """Delete a referral link"""
    await db.referral_links.delete_one({"id": link_id})
    return {"success": True, "message": "Referral link deleted"}

@api_router.post("/referral-links/{code}/click")
async def track_referral_click(code: str):
    """Track a click on a referral link"""
    result = await db.referral_links.update_one(
        {"code": code, "isActive": True},
        {"$inc": {"clicks": 1}}
    )
    if result.modified_count == 0:
        return {"success": False, "message": "Referral link not found or inactive"}
    return {"success": True, "message": "Click tracked"}

@api_router.post("/referral-links/{code}/register")
async def track_referral_registration(code: str):
    """Track a registration from a referral link"""
    result = await db.referral_links.update_one(
        {"code": code, "isActive": True},
        {"$inc": {"registrations": 1}}
    )
    if result.modified_count == 0:
        return {"success": False, "message": "Referral link not found or inactive"}
    return {"success": True, "message": "Registration tracked"}

@api_router.post("/referral-links/generate-for-advocate/{advocate_id}")
async def generate_advocate_referral_link(advocate_id: str):
    """Generate a referral link for a campus advocate"""
    # Get advocate details
    advocate = await db.campus_advocates.find_one({"id": advocate_id}, {"_id": 0})
    if not advocate:
        return {"success": False, "message": "Advocate not found"}
    
    # Generate code from name
    base_code = re.sub(r'[^a-z0-9]+', '-', advocate["name"].lower()).strip('-')
    code = base_code
    
    # Check if code exists, append number if needed
    counter = 1
    while await db.referral_links.find_one({"code": code}):
        code = f"{base_code}-{counter}"
        counter += 1
    
    # Create referral link
    link = ReferralLink(
        code=code,
        name=f"{advocate['name']} - Campus Advocate",
        type="advocate",
        advocateId=advocate_id,
        advocateName=advocate["name"]
    )
    
    await db.referral_links.insert_one(link.model_dump())
    return {
        "success": True, 
        "message": f"Referral link created for {advocate['name']}", 
        "id": link.id,
        "code": link.code
    }

# ============ COMBINED DATA ENDPOINT ============
# This endpoint returns both projects and mentors for the public pages

@api_router.get("/data")
async def get_combined_data():
    """Returns combined projects and mentors data for public pages"""
    projects = await db.projects.find({}, {"_id": 0}).to_list(1000)
    mentors = await db.mentors.find({}, {"_id": 0}).to_list(1000)
    return {"projects": projects, "mentors": mentors}

# ============ CONTRIBUTOR REFERRAL ============

class ContributorRefRequest(BaseModel):
    email: str = Field(..., min_length=4, max_length=200)
    name: Optional[str] = ""

def _slugify(value: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (value or "").lower()).strip("-")
    return s or "user"

@api_router.post("/contributor-referral/generate")
async def generate_contributor_referral(payload: ContributorRefRequest):
    """Issue a referral link to a registered contributor (lookup by email)."""
    norm_email = payload.email.strip().lower()
    if not norm_email or "@" not in norm_email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address")
    # Verify the email is registered as a contributor
    reg = await db.registrations.find_one(
        {"email": {"$regex": f"^{re.escape(norm_email)}$", "$options": "i"},
         "role": "contributor"},
        {"_id": 0}
    )
    if not reg:
        raise HTTPException(
            status_code=404,
            detail="We couldn't find a contributor registration with this email. Please register first or check your email."
        )
    # Reuse existing link if one already exists for this email
    existing = await db.referral_links.find_one(
        {"contributorEmail": norm_email}, {"_id": 0}
    )
    if existing:
        return {"success": True, "link": existing, "created": False}

    # Generate a unique code based on the contributor's name or email
    base = _slugify(reg.get("name") or norm_email.split("@")[0])
    code = base
    suffix = 0
    while await db.referral_links.find_one({"code": code}):
        suffix += 1
        if suffix > 5:
            import secrets
            code = f"{base}-{secrets.token_hex(2)}"
            break
        code = f"{base}-{suffix}"

    link_doc = {
        "id": str(uuid.uuid4()),
        "code": code,
        "name": f"{reg.get('name', 'Contributor')}'s referral",
        "type": "contributor",
        "contributorEmail": norm_email,
        "contributorName": reg.get("name", ""),
        "clicks": 0,
        "registrations": 0,
        "isActive": True,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.referral_links.insert_one({**link_doc, "_id": link_doc["id"]})
    link_doc.pop("_id", None)
    return {"success": True, "link": link_doc, "created": True}

@api_router.get("/contributor-leaderboard")
async def contributor_leaderboard(limit: int = 20):
    """Public leaderboard of contributor referrals sorted by registrations then clicks."""
    limit = max(1, min(limit, 500))
    cursor = db.referral_links.find(
        {"type": "contributor", "isActive": {"$ne": False}},
        {"_id": 0, "code": 1, "contributorName": 1, "contributorEmail": 1, "clicks": 1, "registrations": 1}
    ).sort([("registrations", -1), ("clicks", -1)]).limit(limit)
    rows = await cursor.to_list(length=limit)
    # Mask emails for privacy in the public leaderboard
    out = []
    for r in rows:
        em = r.get("contributorEmail", "")
        masked = em[:2] + "***@" + em.split("@", 1)[1] if "@" in em and len(em) > 4 else "***"
        out.append({
            "code": r.get("code"),
            "name": r.get("contributorName") or masked,
            "email_masked": masked,
            "clicks": r.get("clicks", 0),
            "registrations": r.get("registrations", 0),
        })
    # Total active contributor referrers (uncapped) for accurate "showing X of Y" UX
    total = await db.referral_links.count_documents({"type": "contributor", "isActive": {"$ne": False}})
    return {"leaderboard": out, "total": total}

# ============ BADGE GALLERY ============
@api_router.post("/gallery/badges", response_model=GalleryBadge)
async def create_gallery_badge(payload: GalleryBadgeCreate):
    clean_github = payload.github.lstrip("@").strip()
    badge = GalleryBadge(
        name=payload.name.strip(),
        github=clean_github,
        role=payload.role,
        tagline=(payload.tagline or "").strip(),
    )
    await db.gallery_badges.insert_one({**badge.model_dump(), "_id": badge.id})
    return badge

@api_router.get("/gallery/badges", response_model=List[GalleryBadge])
async def list_gallery_badges(role: Optional[str] = None, limit: int = 60, skip: int = 0):
    query: Dict[str, Any] = {}
    if role in ("contributor", "mentor", "admin"):
        query["role"] = role
    limit = max(1, min(limit, 200))
    skip = max(0, skip)
    cursor = (
        db.gallery_badges
        .find(query, {"_id": 0})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    return await cursor.to_list(length=limit)

@api_router.get("/gallery/badges/count")
async def count_gallery_badges():
    total, contributor, mentor, admin = await asyncio.gather(
        db.gallery_badges.count_documents({}),
        db.gallery_badges.count_documents({"role": "contributor"}),
        db.gallery_badges.count_documents({"role": "mentor"}),
        db.gallery_badges.count_documents({"role": "admin"}),
    )
    return {"total": total, "contributor": contributor, "mentor": mentor, "admin": admin}

# ============ HEALTH CHECK ============

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "SSoC API is running"}

# ============ COMBINED DATA ENDPOINTS (PERFORMANCE) ============

@api_router.get("/public/init")
async def get_public_init_data():
    """Combined endpoint for main site initial load — all DB queries run in parallel."""
    try:
        (
            site_data_doc,
            form_status_doc,
            apply_links_doc,
            testimonials,
            faqs,
            sponsors,
            footer_doc,
            advocates,
            pages,
            counts_raw
        ) = await asyncio.gather(
            db.site_data.find_one({"_id": "main"}),
            db.form_status.find_one({"_id": "main"}),
            db.apply_links.find_one({"_id": "main"}),
            db.testimonials.find({}, {"_id": 0}).to_list(50),
            db.faqs.find({}, {"_id": 0}).to_list(100),
            db.sponsors.find({}, {"_id": 0}).to_list(100),
            db.footer.find_one({"_id": "main"}),
            db.campus_advocates.find({"isActive": True}, {"_id": 0, "photo": 0}).sort("name", 1).to_list(100),
            db.pages.find({"isPublished": True}, {"_id": 0}).to_list(100),
            db.registrations.aggregate([
                {"$group": {"_id": "$role", "count": {"$sum": 1}}}
            ]).to_list(10)
        )
        
        site_data = {k: v for k, v in (site_data_doc or {}).items() if k != "_id"}
        form_status = {k: v for k, v in (form_status_doc or {"contributor": True, "mentor": True, "projectAdmin": True}).items() if k != "_id"}
        apply_links = {k: v for k, v in (apply_links_doc or {}).items() if k != "_id"}
        footer = {k: v for k, v in (footer_doc or {}).items() if k != "_id"}
        
        reg_counts = {item["_id"]: item["count"] for item in counts_raw}
        total = sum(reg_counts.values())
        
        return JSONResponse(
            content={
                "siteData": site_data,
                "formStatus": form_status,
                "applyLinks": apply_links,
                "testimonials": testimonials,
                "faqs": faqs,
                "sponsors": sponsors,
                "footer": footer,
                "advocates": advocates,
                "pages": pages,
                "registrationCounts": {
                    "total": total,
                    "contributor": reg_counts.get("contributor", 0),
                    "mentor": reg_counts.get("mentor", 0),
                    "projectAdmin": reg_counts.get("project-admin", 0),
                }
            },
            headers={"Cache-Control": "public, max-age=30"}
        )
    except Exception as e:
        logging.error(f"Error in public init: {e}")
        return {"error": str(e)}

@api_router.get("/admin/init")
async def get_admin_init_data():
    """Combined endpoint for admin panel initial load — all DB queries run in parallel."""
    try:
        # Run ALL queries in parallel for maximum speed
        (
            site_data_doc,
            form_status_doc,
            apply_links_doc,
            footer_doc,
            projects,
            mentors,
            organizers,
            advocates,
            applications,
            testimonials,
            sponsors,
            faqs,
            registrations,
            pages,
            referral_links,
            tasks,
            completions,
            onboarding_submissions,
            raids,
            raid_completions
        ) = await asyncio.gather(
            db.site_data.find_one({"_id": "main"}),
            db.form_status.find_one({"_id": "main"}),
            db.apply_links.find_one({"_id": "main"}),
            db.footer.find_one({"_id": "main"}),
            db.projects.find({}, {"_id": 0}).to_list(500),
            db.mentors.find({}, {"_id": 0}).to_list(500),
            db.organizers.find({}, {"_id": 0}).to_list(100),
            db.campus_advocates.find({}, {"_id": 0, "photo": 0}).sort("name", 1).to_list(200),
            db.advocate_applications.find({}, {"_id": 0}).to_list(500),
            db.testimonials.find({}, {"_id": 0}).to_list(200),
            db.sponsors.find({}, {"_id": 0}).to_list(200),
            db.faqs.find({}, {"_id": 0}).to_list(200),
            db.registrations.find({}, {"_id": 0}).to_list(50000),
            db.pages.find({}, {"_id": 0}).to_list(100),
            db.referral_links.find({}, {"_id": 0}).to_list(500),
            db.advocate_tasks.find({}, {"_id": 0}).to_list(200),
            db.task_completions.find({}, {"_id": 0}).to_list(5000),
            db.onboarding_submissions.find({}, {"_id": 0}).sort("submittedAt", -1).to_list(10000),
            db.raids.find({}, {"_id": 0}).sort("createdAt", -1).to_list(500),
            db.raid_completions.find({}, {"_id": 0}).sort("completedAt", -1).to_list(20000),
        )
        
        site_data = {k: v for k, v in (site_data_doc or {}).items() if k != "_id"}
        form_status = {k: v for k, v in (form_status_doc or {"contributor": True, "mentor": True, "projectAdmin": True}).items() if k != "_id"}
        apply_links = {k: v for k, v in (apply_links_doc or {}).items() if k != "_id"}
        footer = {k: v for k, v in (footer_doc or {}).items() if k != "_id"}
        
        # Custom fields
        custom_fields = {}
        async for doc in db.custom_fields_by_role.find({}, {"_id": 0}):
            role = doc.get("role")
            if role:
                custom_fields[role] = doc.get("fields", [])
        
        # Section timestamps
        timestamps = {}
        async for doc in db.section_timestamps.find():
            timestamps[doc["_id"]] = doc.get("updatedAt")
        
        return {
            "siteData": site_data,
            "formStatus": form_status,
            "applyLinks": apply_links,
            "footer": footer,
            "projects": projects,
            "mentors": mentors,
            "organizers": organizers,
            "advocates": advocates,
            "applications": applications,
            "testimonials": testimonials,
            "sponsors": sponsors,
            "faqs": faqs,
            "registrations": registrations,
            "pages": pages,
            "referralLinks": referral_links,
            "tasks": tasks,
            "completions": completions,
            "onboardingSubmissions": onboarding_submissions,
            "raids": raids,
            "raidCompletions": raid_completions,
            "customFields": custom_fields,
            "sectionTimestamps": timestamps,
        }
    except Exception as e:
        logging.error(f"Error in admin init: {e}")
        return {"error": str(e)}



# ============ CONTRIBUTOR ONBOARDING ============

class OnboardingSubmission(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=4, max_length=200)
    countryCode: str = Field(default="+91", max_length=8)
    phone: str = Field(..., min_length=4, max_length=20)
    badgeGenerated: bool = False
    productHuntDone: bool = False
    discordJoined: bool = False
    notes: Optional[str] = ""
    submittedAt: Optional[str] = None


@api_router.post("/onboarding/submit")
async def submit_onboarding(submission: OnboardingSubmission):
    email = (submission.email or "").strip().lower()
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        raise HTTPException(status_code=400, detail="Invalid email address")

    doc = submission.model_dump()
    doc["email"] = email
    doc["submittedAt"] = datetime.now(timezone.utc).isoformat()

    # Upsert by email so a contributor can re-submit and update their checklist.
    await db.onboarding_submissions.update_one(
        {"email": email},
        {"$set": doc},
        upsert=True,
    )
    return {"success": True, "message": "Onboarding submitted. Thank you!"}


@api_router.get("/onboarding/list", response_model=List[Dict[str, Any]])
async def list_onboarding_submissions():
    return await db.onboarding_submissions.find({}, {"_id": 0}).sort("submittedAt", -1).to_list(10000)


@api_router.delete("/onboarding/{submission_id}")
async def delete_onboarding_submission(submission_id: str):
    result = await db.onboarding_submissions.delete_one({"id": submission_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"success": True, "message": "Submission deleted"}


# ============ CONTRIBUTOR RAIDS / TASKS ============

class Raid(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., min_length=2, max_length=200)
    description: str = Field(default="", max_length=2000)
    link: Optional[str] = ""
    deadline: Optional[str] = ""  # ISO date string
    points: int = Field(default=10, ge=0, le=10000)
    isActive: bool = True
    isDaily: bool = False
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


class RaidCompletion(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    raidId: str
    name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=4, max_length=200)
    proofUrl: str = Field(..., min_length=4, max_length=500)
    completedAt: Optional[str] = None
    # Calendar day (YYYY-MM-DD in user's local timezone) sent by client.
    # For one-time raids stored as "" so the unique constraint enforces single completion.
    # For daily raids stored as the day so one completion per user per day is allowed.
    completionDay: Optional[str] = ""
    disqualified: bool = False
    disqualifiedReason: Optional[str] = ""


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@api_router.get("/raids", response_model=List[Dict[str, Any]])
async def list_raids(active_only: bool = False):
    query = {"isActive": True} if active_only else {}
    return await db.raids.find(query, {"_id": 0}).sort("createdAt", -1).to_list(500)


@api_router.post("/raids")
async def create_raid(raid: Raid):
    doc = raid.model_dump()
    doc["createdAt"] = _now_iso()
    doc["updatedAt"] = doc["createdAt"]
    await db.raids.insert_one(doc)
    return {"success": True, "message": "Raid created", "id": doc["id"]}


@api_router.put("/raids/{raid_id}")
async def update_raid(raid_id: str, raid: Raid):
    data = raid.model_dump()
    data["id"] = raid_id
    data["updatedAt"] = _now_iso()
    result = await db.raids.update_one({"id": raid_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Raid not found")
    return {"success": True, "message": "Raid updated"}


@api_router.delete("/raids/{raid_id}")
async def delete_raid(raid_id: str):
    result = await db.raids.delete_one({"id": raid_id})
    await db.raid_completions.delete_many({"raidId": raid_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Raid not found")
    return {"success": True, "message": "Raid deleted"}


@api_router.post("/raids/{raid_id}/complete")
async def complete_raid(raid_id: str, completion: RaidCompletion):
    raid = await db.raids.find_one({"id": raid_id})
    if not raid:
        raise HTTPException(status_code=404, detail="Raid not found")
    if not raid.get("isActive", True):
        raise HTTPException(status_code=400, detail="This raid is no longer active")

    email = (completion.email or "").strip().lower()
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        raise HTTPException(status_code=400, detail="Invalid email address")

    proof = (completion.proofUrl or "").strip()
    if not proof.lower().startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Proof must be a valid URL (http/https)")

    is_daily = bool(raid.get("isDaily"))
    # For daily raids: use the client-provided calendar day (user's local TZ).
    # For one-time raids: always "" so (raidId, email, "") is unique → one completion per user.
    completion_day = (completion.completionDay or "").strip() if is_daily else ""
    if is_daily and not re.match(r"^\d{4}-\d{2}-\d{2}$", completion_day):
        # Fall back to UTC today if client didn't send a valid day
        completion_day = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    doc = completion.model_dump()
    doc["raidId"] = raid_id
    doc["email"] = email
    doc["completedAt"] = _now_iso()
    doc["completionDay"] = completion_day

    # Upsert so contributors can update their proof URL for that day
    await db.raid_completions.update_one(
        {"raidId": raid_id, "email": email, "completionDay": completion_day},
        {"$set": doc},
        upsert=True,
    )
    return {
        "success": True,
        "message": "Marked as completed. Thank you!",
        "isDaily": is_daily,
        "completionDay": completion_day,
    }


@api_router.get("/raids/completions", response_model=List[Dict[str, Any]])
async def list_raid_completions(raid_id: Optional[str] = None):
    query = {"raidId": raid_id} if raid_id else {}
    return await db.raid_completions.find(query, {"_id": 0}).sort("completedAt", -1).to_list(20000)


class DisqualifyRequest(BaseModel):
    disqualified: bool = True
    reason: Optional[str] = ""


@api_router.patch("/raids/completions/{completion_id}/disqualify")
async def disqualify_raid_completion(completion_id: str, req: DisqualifyRequest):
    """Mark a completion as fake → its points are revoked from the leaderboard.
    Set disqualified=false to restore."""
    update = {
        "disqualified": bool(req.disqualified),
        "disqualifiedReason": (req.reason or "")[:500],
        "disqualifiedAt": _now_iso() if req.disqualified else None,
    }
    result = await db.raid_completions.update_one({"id": completion_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Completion not found")
    return {"success": True, "disqualified": update["disqualified"]}


@api_router.get("/raids/stats")
async def raids_stats():
    """Public stats: per-raid completion counts + top contributors leaderboard.
    Disqualified completions are excluded from both counts and leaderboard."""
    raids = await db.raids.find({}, {"_id": 0}).to_list(500)
    all_completions = await db.raid_completions.find({}, {"_id": 0}).to_list(20000)
    completions = [c for c in all_completions if not c.get("disqualified")]

    counts: Dict[str, int] = {}
    for c in completions:
        rid = c.get("raidId")
        if rid:
            counts[rid] = counts.get(rid, 0) + 1

    raid_points = {r.get("id"): int(r.get("points", 0) or 0) for r in raids}
    by_email: Dict[str, Dict[str, Any]] = {}
    for c in completions:
        em = (c.get("email") or "").lower()
        if not em:
            continue
        entry = by_email.setdefault(em, {"email": em, "name": c.get("name") or "", "completions": 0, "points": 0})
        entry["completions"] += 1
        entry["points"] += raid_points.get(c.get("raidId"), 0)
        if c.get("name"):
            entry["name"] = c.get("name")

    leaderboard = sorted(by_email.values(), key=lambda x: (-x["points"], -x["completions"]))[:6000]

    return {
        "totalRaids": len(raids),
        "activeRaids": sum(1 for r in raids if r.get("isActive", True)),
        "totalCompletions": len(completions),
        "uniqueRaiders": len(by_email),
        "disqualifiedCount": sum(1 for c in all_completions if c.get("disqualified")),
        "completionsByRaid": counts,
        "leaderboard": leaderboard,
    }


# CORS middleware (must be added before routes)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip compression for responses > 500 bytes
app.add_middleware(GZipMiddleware, minimum_size=500)

# Include the router
app.include_router(api_router)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def create_db_indexes():
    """Create MongoDB indexes for faster queries."""
    try:
        await db.registrations.create_index("email")
        await db.registrations.create_index("role")
        await db.campus_advocates.create_index("isActive")
        await db.advocate_applications.create_index("status")
        await db.advocate_applications.create_index("email")
        await db.sponsors.create_index("isActive")
        await db.advocate_tasks.create_index("isActive")
        await db.task_completions.create_index([("task_id", 1), ("advocate_id", 1)])
        await db.referral_links.create_index("code")
        await db.gallery_badges.create_index([("created_at", -1)])
        await db.gallery_badges.create_index("role")
        await db.onboarding_submissions.create_index("email", unique=True)
        await db.onboarding_submissions.create_index([("submittedAt", -1)])
        await db.raids.create_index([("createdAt", -1)])
        await db.raids.create_index("isActive")
        # Drop the legacy (raidId, email) unique index if it exists — replaced by
        # (raidId, email, completionDay) so daily raids can have one row per day.
        try:
            await db.raid_completions.drop_index("raidId_1_email_1")
        except Exception:
            pass
        # Backfill completionDay = "" on any rows that don't have it (for the unique index to work).
        await db.raid_completions.update_many(
            {"completionDay": {"$exists": False}},
            {"$set": {"completionDay": ""}},
        )
        await db.raid_completions.create_index(
            [("raidId", 1), ("email", 1), ("completionDay", 1)],
            unique=True,
        )
        await db.raid_completions.create_index([("completedAt", -1)])
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# ============ STATIC FRONTEND ============
# Serve the static HTML/CSS/JS site (frontend/public) from the same origin as the
# API so that the frontend's `window.location.origin + '/api'` calls resolve to
# this server. This makes the whole SSOC site runnable as a single service.
# The `/api` routes are registered above via include_router, so they always take
# precedence over this catch-all mount. Set STATIC_DIR to override the location,
# or leave it unset to fall back to ../frontend/public. Disable entirely with
# SERVE_STATIC=false (e.g. when an external ingress serves the frontend, as on
# the original hosting platform).
if os.environ.get("SERVE_STATIC", "true").lower() != "false":
    _static_dir = os.environ.get(
        "STATIC_DIR", str(ROOT_DIR.parent / "frontend" / "public")
    )
    if os.path.isdir(_static_dir):
        app.mount("/", StaticFiles(directory=_static_dir, html=True), name="static")
        logger.info(f"Serving static frontend from {_static_dir}")
    else:
        logger.warning(f"Static dir not found, skipping static mount: {_static_dir}")
