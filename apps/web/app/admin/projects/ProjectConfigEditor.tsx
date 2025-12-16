"use client";

import { useState, useEffect } from "react";
import { getAllProjects, type ProjectInfo } from "@eptss/data-access/services/projectService";
import { safeParseProjectConfig, type ProjectConfig } from "@eptss/project-config";
import { updateProjectConfig } from "./actions";
import { Loader2, Settings, Palette, Shield, Mail, FileText, ToggleLeft, Zap, Globe, BookOpen, MessageSquare, Image } from "lucide-react";
import { ConfigSection } from "./components/ConfigSection";
import { TableOfContents } from "./components/TableOfContents";
import {
  FeatureFlagsEditor,
  UIConfigEditor,
  BusinessRulesEditor,
  EmailConfigEditor,
  ProjectMetadataEditor,
  AutomationConfigEditor,
  SEOMetadataEditor,
  LandingHeroEditor,
  HowItWorksEditor,
  RoundInfoLabelsEditor,
  SubmissionsGalleryEditor,
  SubmitPageEditor,
} from "./components/editors";

export function ProjectConfigEditor() {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
  const [config, setConfig] = useState<ProjectConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Load projects on mount
  useEffect(() => {
    async function loadProjects() {
      try {
        const allProjects = await getAllProjects();
        setProjects(allProjects);
        if (allProjects.length > 0) {
          setSelectedProject(allProjects[0]);
          setConfig(safeParseProjectConfig(allProjects[0].config));
        }
      } catch (err) {
        setError("Failed to load projects");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const handleProjectChange = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setConfig(safeParseProjectConfig(project.config));
      setSuccess(false);
      setError(null);
    }
  };

  const handleSave = async () => {
    if (!selectedProject || !config) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateProjectConfig(selectedProject.id, config);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to save configuration");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (path: string[], value: any) => {
    if (!config) return;

    const newConfig = JSON.parse(JSON.stringify(config));
    let current: any = newConfig;

    // Navigate to the parent of the field we want to update
    for (let i = 0; i < path.length - 1; i++) {
      if (!(path[i] in current)) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    // Set the value
    current[path[path.length - 1]] = value;

    setConfig(newConfig);
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Expand the section if it's collapsed
      if (collapsedSections.has(sectionId)) {
        toggleSection(sectionId);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary">No projects found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Project Selector - Highlighted Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-500/20 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Project Selection</h2>
        </div>
        <label htmlFor="project-select" className="block text-sm font-semibold mb-2">
          Select Project to Configure
        </label>
        <select
          id="project-select"
          value={selectedProject?.id || ""}
          onChange={(e) => handleProjectChange(e.target.value)}
          className="w-full max-w-md px-4 py-3 rounded-lg border-2 border-border bg-background text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} ({project.slug})
            </option>
          ))}
        </select>
        <div className="flex items-center gap-4 mt-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${selectedProject?.isActive ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-600'}`}>
            {selectedProject?.isActive ? '● Active' : '○ Inactive'}
          </span>
          <span className="text-sm text-secondary">
            ID: {selectedProject?.id.slice(0, 8)}...
          </span>
        </div>
      </div>

      {/* Table of Contents */}
      {config && selectedProject && <TableOfContents onNavigate={scrollToSection} />}

      {/* Config Editor */}
      {config && selectedProject && (
        <div className="space-y-8">
          {/* Features & Functionality Group */}
          <div id="features" className="space-y-4 scroll-mt-8">
            <div className="flex items-center gap-2 mb-2">
              <ToggleLeft className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-bold text-purple-500 uppercase tracking-wide">Features & Functionality</h3>
            </div>
            <ConfigSection
              id="feature-flags"
              title="Feature Flags"
              description="Enable or disable features for this project"
              variant="purple"
              icon={<ToggleLeft className="h-5 w-5" />}
              isCollapsed={collapsedSections.has('feature-flags')}
              onToggle={() => toggleSection('feature-flags')}
            >
              <FeatureFlagsEditor
                features={config.features}
                onChange={(features) => updateConfig(["features"], features)}
              />
            </ConfigSection>
          </div>

          {/* Design & Branding Group */}
          <div id="design" className="space-y-4 scroll-mt-8">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-5 w-5 text-pink-500" />
              <h3 className="text-lg font-bold text-pink-500 uppercase tracking-wide">Design & Branding</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ConfigSection
                id="ui-config"
                title="UI Configuration"
                description="Customize colors and theme"
                variant="pink"
                icon={<Palette className="h-5 w-5" />}
                isCollapsed={collapsedSections.has('ui-config')}
                onToggle={() => toggleSection('ui-config')}
              >
                <UIConfigEditor ui={config.ui} onChange={(ui) => updateConfig(["ui"], ui)} />
              </ConfigSection>
              <ConfigSection
                id="project-metadata"
                title="Project Metadata"
                description="Landing page information"
                variant="pink"
                icon={<FileText className="h-5 w-5" />}
                isCollapsed={collapsedSections.has('project-metadata')}
                onToggle={() => toggleSection('project-metadata')}
              >
                <ProjectMetadataEditor
                  metadata={config.metadata}
                  onChange={(metadata) => updateConfig(["metadata"], metadata)}
                />
              </ConfigSection>
            </div>
          </div>

          {/* Rules & Constraints Group */}
          <div id="rules" className="space-y-4 scroll-mt-8">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-bold text-orange-500 uppercase tracking-wide">Rules & Constraints</h3>
            </div>
            <ConfigSection
              id="business-rules"
              title="Business Rules"
              description="Set constraints and limits"
              variant="orange"
              icon={<Shield className="h-5 w-5" />}
              isCollapsed={collapsedSections.has('business-rules')}
              onToggle={() => toggleSection('business-rules')}
            >
              <BusinessRulesEditor
                rules={config.businessRules}
                onChange={(rules) => updateConfig(["businessRules"], rules)}
                features={config.features}
              />
            </ConfigSection>
          </div>

          {/* Communication Group */}
          <div id="communication" className="space-y-4 scroll-mt-8">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-bold text-green-500 uppercase tracking-wide">Communication</h3>
            </div>
            <ConfigSection
              id="email-config"
              title="Email Configuration"
              description="Customize email templates"
              variant="green"
              icon={<Mail className="h-5 w-5" />}
              isCollapsed={collapsedSections.has('email-config')}
              onToggle={() => toggleSection('email-config')}
            >
              <EmailConfigEditor
                email={config.email}
                onChange={(email) => updateConfig(["email"], email)}
              />
            </ConfigSection>
          </div>

          {/* Automation Group */}
          <div id="automation" className="space-y-4 scroll-mt-8">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-bold text-blue-500 uppercase tracking-wide">Automation & Cron Jobs</h3>
            </div>
            <ConfigSection
              id="automation-config"
              title="Automation Configuration"
              description="Configure automated tasks and background jobs"
              variant="blue"
              icon={<Zap className="h-5 w-5" />}
              isCollapsed={collapsedSections.has('automation-config')}
              onToggle={() => toggleSection('automation-config')}
            >
              <AutomationConfigEditor
                automation={config.automation}
                onChange={(automation) => updateConfig(["automation"], automation)}
              />
            </ConfigSection>
          </div>

          {/* Content & Copy Group */}
          <div id="content" className="space-y-4 scroll-mt-8">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-cyan-500" />
              <h3 className="text-lg font-bold text-cyan-500 uppercase tracking-wide">Content & Copy</h3>
            </div>

            <ConfigSection
              id="seo-metadata"
              title="SEO Metadata"
              description="Search engine optimization and social media metadata"
              variant="blue"
              icon={<Globe className="h-5 w-5" />}
              isCollapsed={collapsedSections.has('seo-metadata')}
              onToggle={() => toggleSection('seo-metadata')}
            >
              <SEOMetadataEditor
                seo={config.seo}
                onChange={(seo) => updateConfig(["seo"], seo)}
              />
            </ConfigSection>

            <ConfigSection
              id="landing-hero"
              title="Landing Page Hero"
              description="Main hero section content on project landing page"
              variant="pink"
              icon={<Image className="h-5 w-5" />}
              isCollapsed={collapsedSections.has('landing-hero')}
              onToggle={() => toggleSection('landing-hero')}
            >
              <LandingHeroEditor
                hero={config.content.pages.home.hero}
                onChange={(hero) => updateConfig(["content", "pages", "home", "hero"], hero)}
              />
            </ConfigSection>

            <ConfigSection
              id="how-it-works"
              title="How It Works Section"
              description="Steps, benefits, testimonials, and CTAs"
              variant="purple"
              icon={<BookOpen className="h-5 w-5" />}
              isCollapsed={collapsedSections.has('how-it-works')}
              onToggle={() => toggleSection('how-it-works')}
            >
              <HowItWorksEditor
                howItWorks={config.content.pages.home.howItWorks}
                onChange={(howItWorks) => updateConfig(["content", "pages", "home", "howItWorks"], howItWorks)}
              />
            </ConfigSection>

            <ConfigSection
              id="round-info-labels"
              title="Round Info Labels"
              description="Phase-specific labels for round information card"
              variant="orange"
              icon={<MessageSquare className="h-5 w-5" />}
              isCollapsed={collapsedSections.has('round-info-labels')}
              onToggle={() => toggleSection('round-info-labels')}
            >
              <RoundInfoLabelsEditor
                labels={config.content.pages.home.roundInfo}
                onChange={(labels) => updateConfig(["content", "pages", "home", "roundInfo"], labels)}
              />
            </ConfigSection>

            <ConfigSection
              id="submissions-gallery"
              title="Submissions Gallery"
              description="Past submissions gallery content"
              variant="green"
              icon={<Image className="h-5 w-5" />}
              isCollapsed={collapsedSections.has('submissions-gallery')}
              onToggle={() => toggleSection('submissions-gallery')}
            >
              <SubmissionsGalleryEditor
                gallery={config.content.pages.home.submissionsGallery}
                onChange={(gallery) => updateConfig(["content", "pages", "home", "submissionsGallery"], gallery)}
              />
            </ConfigSection>

            <ConfigSection
              id="submit-page"
              title="Submit Page Content"
              description="Submit page form labels and messages"
              variant="blue"
              icon={<FileText className="h-5 w-5" />}
              isCollapsed={collapsedSections.has('submit-page')}
              onToggle={() => toggleSection('submit-page')}
            >
              <SubmitPageEditor
                submitContent={config.content.pages.submit}
                onChange={(submitContent) => updateConfig(["content", "pages", "submit"], submitContent)}
              />
            </ConfigSection>
          </div>

          {/* Save Button - Sticky at bottom */}
          <div className="sticky bottom-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 shadow-2xl border-2 border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold text-lg mb-1">Save Configuration</h4>
                <p className="text-white/80 text-sm">Click to save all changes to {selectedProject.name}</p>
              </div>
              <div className="flex items-center gap-4">
                {success && (
                  <span className="flex items-center gap-2 text-green-300 font-semibold bg-green-500/20 px-4 py-2 rounded-lg">
                    <span className="text-xl">✓</span> Saved successfully!
                  </span>
                )}
                {error && (
                  <span className="flex items-center gap-2 text-red-300 font-semibold bg-red-500/20 px-4 py-2 rounded-lg">
                    <span className="text-xl">✗</span> {error}
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg transition-all hover:scale-105"
                >
                  {saving && <Loader2 className="h-5 w-5 animate-spin" />}
                  {saving ? "Saving..." : "Save All Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
