"""Pydantic schemas for request/response - match JS API."""
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class SignupBody(BaseModel):
    name: str | None = None
    email: str | None = None
    mobile: str | None = None
    password: str | None = None
    preferredLanguage: str = "en"


class LoginBody(BaseModel):
    email: str | None = None
    mobile: str | None = None
    password: str | None = None


class CompleteSubtopicBody(BaseModel):
    userId: str
    moduleId: str
    subTopicId: str


class SubmitQuizBody(BaseModel):
    userId: str
    moduleId: str
    score: int
    totalQuestions: int


class UpdateProgressBody(BaseModel):
    userId: str
    moduleId: str | None = None
    quizScore: int | None = None
    pointsEarned: int | None = None
    badge: str | None = None
    gameType: str | None = None


class EmergencyContact(BaseModel):
    name: str
    mobile: str

class UpdateProfileBody(BaseModel):
    name: str | None = None
    email: str | None = None
    mobile: str | None = None
    preferredLanguage: str | None = None
    showOnLeaderboard: bool | None = None
    emailNotifications: bool | None = None
    emergencyContacts: list[EmergencyContact] | None = None


class AIChatbotBody(BaseModel):
    message: str
    context: str | None = None
    lang: str = "en"
    history: list[dict[str, Any]] | None = None
    imageBase64: str | None = None
    imageMimeType: str | None = None

class AIQuizBody(BaseModel):
    moduleId: str
    userProgress: dict[str, Any] = Field(default_factory=dict)
    lang: str = "en"
    seed: str | None = None

class PostCreateBody(BaseModel):
    userId: str
    username: str
    content: str
    imageUrl: str | None = None

class CommentCreateBody(BaseModel):
    userId: str
    username: str
    text: str

class CompetitionSubmitBody(BaseModel):
    userId: str
    username: str
    competitionId: str
    essayContent: str

class ReportPostBody(BaseModel):
    userId: str
    reason: str

class UpdateEntryStatusBody(BaseModel):
    status: str # approved, rejected, pending
    feedback: str | None = None

class GameScoreBody(BaseModel):
    userId: str
    gameType: str
    score: int

class UpdateStreakBody(BaseModel):
    userId: str

class UpdateLocationBody(BaseModel):
    userId: str
    latitude: float
    longitude: float

class TriggerSOSBody(BaseModel):
    userId: str
    message: str | None = "Emergency Help Needed!"
    latitude: float | None = None
    longitude: float | None = None

class LawyerProfileCreateBody(BaseModel):
    userId: str
    name: str
    specialization: str
    experience: int
    bio: str
    email: str
    phone: str
    officeAddress: str

class UpdateLawyerStatusBody(BaseModel):
    verified: bool

class SafetyRecordingBody(BaseModel):
    userId: str
    type: str # audio, video
    url: str
    location: dict[str, float] | None = None
