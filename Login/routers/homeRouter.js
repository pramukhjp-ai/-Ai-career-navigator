const express = require("express");
const Router = express.Router();
const homeSchema = require("../models/homeSchema");
const PDFDocument = require("pdfkit");

// Render the registration form
Router.get("/", (req, res) => {
	res.render("register", { title: "Fill Form", password: "", email: "" });
});

// Handle user registration
Router.post("/register", async (req, res) => {
	try {
		const { name, number, email, password, cpassword } = req.body;

		if (password === cpassword) {
			const userData = new homeSchema({
				name,
				number,
				email,
				password,
			});

			userData.save((err) => {
				if (err) {
					console.log("err");
				} else {
					res.render("register", { title: "Done", password: "", email: "" });
				}
			});

			const useremail = await homeSchema.findOne({ email: email });
			if (email === useremail.email) {
				res.render("register", {
					title: "",
					password: "",
					email: "Email is Already there plz chose different one",
				});
			} else {
				console.log("err");
			}
		} else {
			res.render("register", {
				title: "",
				password: "Password not Matching",
				email: "",
			});
		}
	} catch (error) {
		res.render("register", { title: "Error in Code", password: "", email: "" });
	}
});

// inside Login/routers/homeRouter.js

// POST /login (replace your existing handler)
Router.post("/login", (req, res) => {
  const { email, password } = req.body;

  homeSchema.findOne({ email: email }, (err, result) => {
    if (err) {
      console.error("[login] DB error:", err);
      return res.render("register", { title: "", password: "", email: "Server error" });
    }

    if (result && email === result.email && password === result.password) {
      // store minimal user info in session
      req.session.user = { id: result._id, name: result.name, email: result.email };
      return res.redirect("/dashboard");
    } else {
      return res.render("register", { title: "", password: "Invalid credentials", email: "" });
    }
  });
});

// GET /dashboard (add this just before module.exports)
Router.get("/dashboard", (req, res) => {
  if (!req.session || !req.session.user) {
    // not logged in -> go to login/register page
    return res.redirect('/');
  }
  res.render("dashboard", { name: req.session.user.name });
});


// Logout and destroy the session
Router.get("/logout", (req, res) => {
	req.session.destroy(() => {
		res.redirect("/");
	});
});

// Render the iq.ejs page
// Render the iq.ejs page
Router.get("/iq", (req, res) => {
	res.render("iq"); // Renders 'views/iq.ejs'
});

//Render the faq.ejs page
Router.get("/faq", (req, res) => {
  return res.render("faq/faq"); // relative to your views folder
});

// Render the resume builder page
Router.get("/resume/builder", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/');
  }
  return res.render("resume_builder"); // renders 'views/resume_builder.ejs'
});

// GET /resume/list - Display all user resumes
Router.get("/resume/list", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/');
  }
  return res.render("resume_list"); // renders 'views/resume_list.ejs'
});

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[date.getMonth()] + ' ' + date.getFullYear();
};

// GET /resume/:id - Display single resume
Router.get("/resume/:id", async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/');
  }
  
  try {
    const Resume = require("../models/resumeSchema");
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.session.user.id });
    
    if (!resume) {
      return res.status(404).render("404", { message: "Resume not found" });
    }

    return res.render("resume_view_professional", { resume: resume.toObject(), formatDate });
  } catch (error) {
    console.error("Error fetching resume:", error);
    return res.status(500).render("500", { message: "Server error" });
  }
});

// GET /resume/:id/edit - Display resume edit form
Router.get("/resume/:id/edit", async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/');
  }
  
  try {
    const Resume = require("../models/resumeSchema");
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.session.user.id });
    
    if (!resume) {
      return res.status(404).render("404", { message: "Resume not found" });
    }

    return res.render("resume_edit", { resume: resume.toObject(), formatDate });
  } catch (error) {
    console.error("Error fetching resume:", error);
    return res.status(500).render("500", { message: "Server error" });
  }
});

// GET /resume/:id/analyze - Display ATS analysis
Router.get("/resume/:id/analyze", async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/');
  }
  
  try {
    const Resume = require("../models/resumeSchema");
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.session.user.id });
    
    if (!resume) {
      return res.status(404).render("404", { message: "Resume not found" });
    }

    return res.render("resume_analysis", { resume: resume.toObject() });
  } catch (error) {
    console.error("Error fetching resume:", error);
    return res.status(500).render("500", { message: "Server error" });
  }
});

// GET /resume/:id/download-pdf - Download resume as PDF
Router.get("/resume/:id/download-pdf", async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  
  try {
    const Resume = require("../models/resumeSchema");
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.session.user.id });
    
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    // Create PDF document
    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
      bufferPages: true
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resume.resumeTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf"`);

    // Pipe to response
    doc.pipe(res);

    // Add content to PDF
    addResumeToPDF(doc, resume);

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({ success: false, message: "Error generating PDF" });
  }
});

// Helper function to add resume content to PDF
function addResumeToPDF(doc, resume) {
  const colors = {
    primary: '#667eea',
    accent: '#764ba2',
    dark: '#333333',
    light: '#666666'
  };

  // Helper function to add a section
  function addSection(title, content) {
    if (!content || content.length === 0) return;
    
    doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.primary);
    doc.text(title.toUpperCase(), { underline: true });
    doc.fontSize(10).font('Helvetica').fillColor(colors.dark);
    doc.moveDown(0.3);
  }

  // Header with name and contact info
  doc.fontSize(20).font('Helvetica-Bold').fillColor(colors.dark);
  doc.text(`${resume.personalInfo.firstName} ${resume.personalInfo.lastName}`, { align: 'center' });
  
  doc.fontSize(9).font('Helvetica').fillColor(colors.light);
  const contactInfo = [];
  if (resume.personalInfo.email) contactInfo.push(resume.personalInfo.email);
  if (resume.personalInfo.phone) contactInfo.push(resume.personalInfo.phone);
  if (resume.personalInfo.location) contactInfo.push(resume.personalInfo.location);
  if (resume.personalInfo.linkedin) contactInfo.push(resume.personalInfo.linkedin);
  
  doc.text(contactInfo.join(' | '), { align: 'center' });
  doc.moveDown(0.5);

  // Add a horizontal line
  doc.strokeColor(colors.primary).lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);

  // Professional Summary
  if (resume.professionalSummary) {
    addSection('PROFESSIONAL SUMMARY');
    doc.fontSize(10).font('Helvetica').fillColor(colors.dark);
    doc.text(resume.professionalSummary, { align: 'left', width: 475 });
    doc.moveDown(0.5);
  }

  // Experience
  if (resume.experience && resume.experience.length > 0) {
    addSection('EXPERIENCE');
    resume.experience.forEach(exp => {
      doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.dark);
      doc.text(exp.jobTitle);
      
      doc.fontSize(9).font('Helvetica').fillColor(colors.accent);
      doc.text(exp.company, { width: 475 });
      
      doc.fontSize(8).fillColor(colors.light);
      const startDate = exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '';
      const endDate = exp.isCurrentlyWorking ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '');
      doc.text(`${startDate} - ${endDate}`, { width: 475 });
      
      if (exp.location) {
        doc.text(exp.location);
      }
      
      if (exp.description) {
        doc.fontSize(9).font('Helvetica').fillColor(colors.dark);
        doc.text(exp.description, { width: 475 });
      }
      
      doc.moveDown(0.3);
    });
    doc.moveDown(0.3);
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    addSection('EDUCATION');
    resume.education.forEach(edu => {
      doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.dark);
      doc.text(`${edu.degree} in ${edu.field}`);
      
      doc.fontSize(9).font('Helvetica').fillColor(colors.accent);
      doc.text(edu.school, { width: 475 });
      
      doc.fontSize(8).fillColor(colors.light);
      const gradDate = new Date(edu.graduationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      doc.text(`Graduated: ${gradDate}`);
      
      if (edu.gpa) {
        doc.text(`GPA: ${edu.gpa}`);
      }
      
      doc.moveDown(0.3);
    });
    doc.moveDown(0.3);
  }

  // Skills
  if (resume.skills && resume.skills.length > 0) {
    addSection('SKILLS');
    doc.fontSize(9).font('Helvetica').fillColor(colors.dark);
    
    // Split skills into multiple lines (6 skills per line)
    for (let i = 0; i < resume.skills.length; i += 6) {
      const skillsChunk = resume.skills.slice(i, i + 6).join(' • ');
      doc.text(skillsChunk, { width: 475 });
    }
    doc.moveDown(0.3);
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    addSection('CERTIFICATIONS');
    resume.certifications.forEach(cert => {
      doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.dark);
      doc.text(cert.certificationName);
      
      doc.fontSize(8).font('Helvetica').fillColor(colors.accent);
      doc.text(cert.issuer);
      
      doc.fontSize(8).fillColor(colors.light);
      const issueDate = new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      doc.text(`Issued: ${issueDate}`);
      
      doc.moveDown(0.2);
    });
    doc.moveDown(0.3);
  }

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    addSection('PROJECTS');
    resume.projects.forEach(project => {
      doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.dark);
      doc.text(project.projectName);
      
      if (project.technologies) {
        doc.fontSize(8).font('Helvetica').fillColor(colors.accent);
        doc.text(`Technologies: ${project.technologies}`);
      }
      
      doc.fontSize(9).font('Helvetica').fillColor(colors.dark);
      doc.text(project.description, { width: 475 });
      
      doc.moveDown(0.2);
    });
    doc.moveDown(0.3);
  }

  // Languages
  if (resume.languages && resume.languages.length > 0) {
    addSection('LANGUAGES');
    resume.languages.forEach(lang => {
      doc.fontSize(9).font('Helvetica').fillColor(colors.dark);
      doc.text(`${lang.language} - ${lang.proficiency}`);
    });
  }

  // Footer with generation timestamp
  doc.fontSize(8).fillColor(colors.light);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US')} using AI Career Navigator`, {
    align: 'center',
    y: doc.page.height - 40
  });
}

module.exports = Router;
