package com.carbon.accounting.infrastructure.service;

import com.carbon.accounting.core.domain.model.EmissionRecord;
import com.carbon.accounting.core.repository.EmissionRepository;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Paragraph;
import com.lowagie.text.PageSize;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.PiePlot;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

        private final EmissionRepository emissionRepository;

        public byte[] generateEmissionReport(UUID tenantId, UUID industryTypeId, String companyName, Instant startDate,
                        Instant endDate) {
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                Document document = new Document(PageSize.A4);

                try {
                        PdfWriter.getInstance(document, out);
                        document.open();

                        // Font styles
                        com.lowagie.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22,
                                        Color.DARK_GRAY);
                        com.lowagie.text.Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14,
                                        Color.GRAY);
                        com.lowagie.text.Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12,
                                        Color.BLACK);
                        com.lowagie.text.Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10,
                                        Color.BLACK);
                        com.lowagie.text.Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);

                        // Title
                        Paragraph title = new Paragraph("Environmental Emission Report", headerFont);
                        title.setAlignment(Element.ALIGN_CENTER);
                        title.setSpacingAfter(10);
                        document.add(title);

                        // Sub-header (Company and Date)
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
                                        .withZone(ZoneId.systemDefault());
                        String period = (startDate != null ? formatter.format(startDate) : "Beginning") + " to "
                                        + (endDate != null ? formatter.format(endDate) : "Now");

                        Paragraph subTitle = new Paragraph(
                                        "Company: " + companyName + "\nPeriod: " + period + "\nGenerated on: "
                                                        + formatter.format(Instant.now()),
                                        subHeaderFont);
                        subTitle.setSpacingAfter(30);
                        document.add(subTitle);

                        // Data Preparation (COMMITTED only)
                        List<EmissionRecord> records = emissionRepository.findByTenantAndStatus(tenantId, "COMMITTED")
                                        .stream()
                                        .filter(e -> (startDate == null || !e.getRecordedAt().isBefore(startDate)))
                                        .filter(e -> (endDate == null || !e.getRecordedAt().isAfter(endDate)))
                                        .collect(Collectors.toList());

                        double totalEmission = records.stream().mapToDouble(EmissionRecord::getCalculatedEmission)
                                        .sum();
                        Map<String, Double> scopeTotals = records.stream().collect(Collectors.groupingBy(
                                        EmissionRecord::getScope,
                                        Collectors.summingDouble(EmissionRecord::getCalculatedEmission)));

                        double scope1Total = scopeTotals.getOrDefault("SCOPE1", 0.0);
                        double scope2Total = scopeTotals.getOrDefault("SCOPE2", 0.0);
                        double scope3Total = scopeTotals.getOrDefault("SCOPE3", 0.0);

                        // Section 1: Summary Cards (in table format)
                        document.add(
                                        new Paragraph("1. Emission Summary (tCO2e)",
                                                        FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
                        document.add(new Paragraph(" "));

                        // Add Summary Table
                        PdfPTable summaryTable = new PdfPTable(2);
                        summaryTable.setWidthPercentage(100);
                        addTableCell(summaryTable, "Total Scope 1 (Direct)", headFont);
                        addTableCell(summaryTable, String.format("%.2f tCO2e", scope1Total), normalFont);
                        addTableCell(summaryTable, "Total Scope 2 (Energy)", headFont);
                        addTableCell(summaryTable, String.format("%.2f tCO2e", scope2Total), normalFont);
                        addTableCell(summaryTable, "Total Scope 3 (Indirect)", headFont);
                        addTableCell(summaryTable, String.format("%.2f tCO2e", scope3Total), normalFont);
                        addTableCell(summaryTable, "Net Carbon Footprint", boldFont);
                        addTableCell(summaryTable, String.format("%.2f tCO2e", totalEmission), boldFont);
                        document.add(summaryTable);

                        document.add(new Paragraph(" "));

                        // Add Chart
                        try {
                                byte[] chartImg = generateScopePieChart(scope1Total, scope2Total, scope3Total);
                                com.lowagie.text.Image chart = com.lowagie.text.Image.getInstance(chartImg);
                                chart.setAlignment(Element.ALIGN_CENTER);
                                chart.scaleToFit(400, 300);
                                document.add(chart);
                        } catch (Exception e) {
                                document.add(new Paragraph("Note: Chart generation failed."));
                        }

                        // Section 2: Detailed Records
                        document.add(
                                        new Paragraph("2. Detailed Emission Records",
                                                        FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
                        document.add(new Paragraph(" "));

                        PdfPTable table = new PdfPTable(6);
                        table.setWidthPercentage(100);
                        table.setSpacingBefore(10);
                        table.setWidths(new float[] { 2f, 2f, 3f, 2f, 1.5f, 2f });

                        addTableCell(table, "Date", headFont);
                        addTableCell(table, "Scope", headFont);
                        addTableCell(table, "Activity", headFont);
                        addTableCell(table, "Quantity", headFont);
                        addTableCell(table, "Factor", headFont);
                        addTableCell(table, "tCO2e", headFont);

                        for (EmissionRecord record : records) {
                                addTableCell(table, formatter.format(record.getRecordedAt()), normalFont);
                                addTableCell(table, record.getScope(), normalFont);
                                addTableCell(table, record.getActivityType() != null ? record.getActivityType() : "N/A",
                                                normalFont);
                                addTableCell(table,
                                                record.getActivityQuantity() != null
                                                                ? record.getActivityQuantity().toString() + " "
                                                                                + record.getActivityUnit()
                                                                : "N/A",
                                                normalFont);
                                addTableCell(table,
                                                record.getEmissionFactor() != null
                                                                ? record.getEmissionFactor().toString()
                                                                : "N/A",
                                                normalFont);
                                addTableCell(table, String.format("%.2f", record.getCalculatedEmission()), normalFont);
                        }

                        document.add(table);

                        // Footer
                        Paragraph footer = new Paragraph(
                                        "\n\nThis is a system-generated report from Carbon Accounting Platform.",
                                        FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8));
                        footer.setAlignment(Element.ALIGN_CENTER);
                        document.add(footer);

                        document.close();
                } catch (Exception e) {
                        e.printStackTrace();
                }

                return out.toByteArray();
        }

        private void addTableCell(PdfPTable table, String text, com.lowagie.text.Font font) {
                PdfPCell cell = new PdfPCell(new Phrase(text, font));
                cell.setPadding(6);
                table.addCell(cell);
        }

        private byte[] generateScopePieChart(double s1, double s2, double s3) throws IOException {
                org.jfree.data.general.DefaultPieDataset<String> dataset = new org.jfree.data.general.DefaultPieDataset<>();
                dataset.setValue("Scope 1", s1);
                dataset.setValue("Scope 2", s2);
                dataset.setValue("Scope 3", s3);

                JFreeChart chart = ChartFactory.createPieChart(
                                "Scope Distribution",
                                dataset,
                                true, true, false);

                @SuppressWarnings("unchecked")
                PiePlot<String> plot = (PiePlot<String>) chart.getPlot();
                plot.setSectionPaint("Scope 1", new Color(16, 185, 129));
                plot.setSectionPaint("Scope 2", new Color(59, 130, 246));
                plot.setSectionPaint("Scope 3", new Color(245, 158, 11));
                plot.setBackgroundPaint(Color.WHITE);
                plot.setOutlineVisible(false);

                BufferedImage img = chart.createBufferedImage(600, 400);
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(img, "png", baos);
                return baos.toByteArray();
        }
}
