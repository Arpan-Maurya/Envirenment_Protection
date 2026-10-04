import { jsPDF } from "jspdf";
import { UserProfile, CarbonData } from "../types";

export const generatePDFReport = (user: UserProfile, carbonData: CarbonData) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  // Header Background
  doc.setFillColor(34, 197, 94); // #22c55e
  doc.rect(0, 0, 210, 40, 'F');

  // Title
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("CARBONIQ", 20, 25);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Your Monthly Sustainability Report", 20, 33);

  // Report Info
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(`Generated on: ${date}`, 150, 50);

  // User Section
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.setFont("helvetica", "bold");
  doc.text("User Profile", 20, 65);
  
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.line(20, 68, 190, 68);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${user.name}`, 20, 80);
  doc.text(`Location: ${user.city}`, 20, 88);
  doc.text(`Eco Status: Level ${user.level} (Lifetime ${user.lifetimeXp || 0} XP)`, 20, 96);
  doc.text(`Streak: ${user.streak || 0} days (best ${user.longestStreak || 0})`, 20, 104);

  // Footprint Summary
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Carbon Footprint Summary", 20, 115);
  doc.line(20, 118, 190, 118);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Emissions (Monthly):`, 20, 130);
  doc.setFont("helvetica", "bold");
  doc.text(`${carbonData.total} kg CO2e`, 80, 130);

  doc.setFont("helvetica", "normal");
  doc.text(`Monthly Goal/Budget:`, 20, 138);
  doc.setFont("helvetica", "bold");
  doc.text(`${carbonData.budget} kg CO2e`, 80, 138);

  const savings = carbonData.budget - carbonData.spent;
  doc.setFont("helvetica", "normal");
  doc.text(`Difference from Budget:`, 20, 146);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(savings >= 0 ? 34 : 239, savings >= 0 ? 197 : 68, savings >= 0 ? 94 : 68);
  doc.text(`${Math.abs(savings)} kg CO2e ${savings >= 0 ? 'Under' : 'Over'} Budget`, 80, 146);

  // Category Breakdown
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.text("Category Breakdown", 20, 165);
  doc.line(20, 168, 190, 168);

  let yPos = 180;
  Object.entries(carbonData.breakdown).forEach(([category, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`${category}:`, 30, yPos);
    doc.setFont("helvetica", "bold");
    doc.text(`${value} kg CO2e`, 80, yPos);
    yPos += 10;
  });

  // Insights / Footer
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.rect(20, 240, 170, 30, 'F');
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text("Did you know? Switching to a plant-based diet can reduce your food carbon", 30, 252);
  doc.text("footprint by up to 50%. Keep up the great work!", 30, 258);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("CARBONIQ | Sustaining the Future", 20, 285);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonth = monthNames[new Date().getMonth()];
  doc.save(`CarbonIQ_Report_${currentMonth}_${new Date().getFullYear()}.pdf`);
};
