package tn.pfe.arabicquality.reports.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.pfe.arabicquality.catalog.domain.EvaluationValue;
import tn.pfe.arabicquality.catalog.repository.EvaluationCategoryRepository;
import tn.pfe.arabicquality.catalog.repository.EvaluationValueRepository;
import tn.pfe.arabicquality.catalog.repository.QuestionRepository;
import tn.pfe.arabicquality.catalog.repository.RequiredDocumentRepository;
import tn.pfe.arabicquality.entities.domain.RegistrationRequest;
import tn.pfe.arabicquality.entities.repository.EducationalEntityRepository;
import tn.pfe.arabicquality.entities.repository.RegistrationRequestRepository;
import tn.pfe.arabicquality.reports.dto.ReportsDtos;
import tn.pfe.arabicquality.requests.domain.RequestStatus;
import tn.pfe.arabicquality.requests.repository.EvaluationRequestRepository;
import tn.pfe.arabicquality.users.repository.UserRepository;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportsDashboardService {

    private final RegistrationRequestRepository registrationRepository;
    private final EducationalEntityRepository entityRepository;
    private final UserRepository userRepository;
    private final EvaluationCategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;
    private final RequiredDocumentRepository requiredDocumentRepository;
    private final EvaluationValueRepository valueRepository;
    private final EvaluationRequestRepository requestRepository;

    @Transactional(readOnly = true)
    public ReportsDtos.DashboardDto dashboard() {
        long totalRegistrations = registrationRepository.count();
        long activeEntities = entityRepository.count();
        long activeUsers = userRepository.findAll().stream()
                .filter(user -> user.getDeletedAt() == null && user.isActive())
                .count();
        long totalRequests = requestRepository.count();

        List<ReportsDtos.BucketDto> registrationStatuses = registrationStatusBuckets();
        List<ReportsDtos.BucketDto> requestStatuses = requestStatusBuckets();
        List<ReportsDtos.BucketDto> userRoles = userRoleBuckets();
        List<ReportsDtos.CategoryResourceDto> categoryResources = categoryResources();
        List<ReportsDtos.ValueScaleDto> valueScale = valueScale();

        long totalQuestions = categoryResources.stream().mapToLong(ReportsDtos.CategoryResourceDto::getQuestionCount).sum();
        long totalRequiredDocs = categoryResources.stream().mapToLong(ReportsDtos.CategoryResourceDto::getRequiredDocumentCount).sum();

        return new ReportsDtos.DashboardDto(
                List.of(
                        new ReportsDtos.KpiDto("registrations", "Registration requests", totalRegistrations, ""),
                        new ReportsDtos.KpiDto("entities", "Educational entities", activeEntities, ""),
                        new ReportsDtos.KpiDto("users", "Active users", activeUsers, ""),
                        new ReportsDtos.KpiDto("requests", "Evaluation requests", totalRequests, ""),
                        new ReportsDtos.KpiDto("questions", "Catalog questions", totalQuestions, ""),
                        new ReportsDtos.KpiDto("requiredDocs", "Required documents", totalRequiredDocs, "")
                ),
                registrationStatuses,
                requestStatuses,
                userRoles,
                categoryResources,
                valueScale,
                recentRegistrations()
        );
    }

    @Transactional(readOnly = true)
    public byte[] exportPdf() {
        ReportsDtos.DashboardDto data = dashboard();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfDocument pdf = new PdfDocument(new PdfWriter(out));
        Document document = new Document(pdf);

        document.add(new Paragraph("Arabic Quality Platform - Advanced Reports")
                .setBold()
                .setFontSize(16));
        document.add(new Paragraph("Live export generated from platform resources")
                .setFontSize(10));

        document.add(new Paragraph("Key metrics").setBold().setMarginTop(16));
        Table kpiTable = new Table(UnitValue.createPercentArray(new float[] { 70, 30 }))
                .useAllAvailableWidth();
        addHeader(kpiTable, "Metric");
        addHeader(kpiTable, "Value");
        data.getKpis().forEach(kpi -> {
            kpiTable.addCell(kpi.getLabel());
            kpiTable.addCell(String.valueOf(kpi.getValue()) + (kpi.getSuffix() == null ? "" : kpi.getSuffix()));
        });
        document.add(kpiTable);

        document.add(new Paragraph("Registration requests by status").setBold().setMarginTop(16));
        document.add(bucketTable(data.getRegistrationStatuses()));

        document.add(new Paragraph("Users by role").setBold().setMarginTop(16));
        document.add(bucketTable(data.getUserRoles()));

        document.add(new Paragraph("Catalog resources").setBold().setMarginTop(16));
        Table catalogTable = new Table(UnitValue.createPercentArray(new float[] { 15, 35, 15, 20, 15 }))
                .useAllAvailableWidth();
        addHeader(catalogTable, "Code");
        addHeader(catalogTable, "Category");
        addHeader(catalogTable, "Questions");
        addHeader(catalogTable, "Required docs");
        addHeader(catalogTable, "Active");
        data.getCategoryResources().forEach(category -> {
            catalogTable.addCell(category.getCode());
            catalogTable.addCell(category.getNameEn());
            catalogTable.addCell(String.valueOf(category.getQuestionCount()));
            catalogTable.addCell(String.valueOf(category.getRequiredDocumentCount()));
            catalogTable.addCell(category.isActive() ? "Yes" : "No");
        });
        document.add(catalogTable);

        document.close();
        return out.toByteArray();
    }

    @Transactional(readOnly = true)
    public byte[] exportExcel() throws IOException {
        ReportsDtos.DashboardDto data = dashboard();
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            writeKpis(workbook, data);
            writeBuckets(workbook, "Registration status", data.getRegistrationStatuses());
            writeBuckets(workbook, "Evaluation status", data.getRequestStatuses());
            writeBuckets(workbook, "User roles", data.getUserRoles());
            writeCatalog(workbook, data);
            writeValueScale(workbook, data);
            writeRecentRegistrations(workbook, data);
            workbook.write(out);
            return out.toByteArray();
        }
    }

    private List<ReportsDtos.BucketDto> registrationStatusBuckets() {
        return List.of(RegistrationRequest.Status.values()).stream()
                .map(status -> new ReportsDtos.BucketDto(
                        status.name(),
                        status.name().replace('_', ' '),
                        registrationRepository.countByStatus(status)))
                .toList();
    }

    private List<ReportsDtos.BucketDto> requestStatusBuckets() {
        return List.of(RequestStatus.values()).stream()
                .map(status -> new ReportsDtos.BucketDto(
                        status.name(),
                        status.name().replace('_', ' '),
                        requestRepository.countByStatus(status)))
                .toList();
    }

    private List<ReportsDtos.BucketDto> userRoleBuckets() {
        return userRepository.findAll().stream()
                .filter(user -> user.getDeletedAt() == null)
                .collect(Collectors.groupingBy(user -> user.getRole().getCode(), Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new ReportsDtos.BucketDto(entry.getKey(), entry.getKey().replace("ROLE_", ""), entry.getValue()))
                .toList();
    }

    private List<ReportsDtos.CategoryResourceDto> categoryResources() {
        Map<Long, Long> questionCounts = questionRepository.findAll().stream()
                .collect(Collectors.groupingBy(question -> question.getCategory().getId(), Collectors.counting()));
        Map<Long, Long> requiredDocCounts = requiredDocumentRepository.findAll().stream()
                .collect(Collectors.groupingBy(doc -> doc.getCategory().getId(), Collectors.counting()));

        return categoryRepository.findAllByOrderByDisplayOrderAscNameEnAsc().stream()
                .map(category -> new ReportsDtos.CategoryResourceDto(
                        category.getId(),
                        category.getCode(),
                        category.getNameAr(),
                        category.getNameEn(),
                        questionCounts.getOrDefault(category.getId(), 0L),
                        requiredDocCounts.getOrDefault(category.getId(), 0L),
                        category.isActive()))
                .toList();
    }

    private List<ReportsDtos.ValueScaleDto> valueScale() {
        return valueRepository.findAllByOrderByDisplayOrderAscCodeAsc().stream()
                .map(this::toValueScale)
                .toList();
    }

    private ReportsDtos.ValueScaleDto toValueScale(EvaluationValue value) {
        return new ReportsDtos.ValueScaleDto(
                value.getCode(),
                value.getLabelAr(),
                value.getLabelEn(),
                value.getNumericScore(),
                value.isActive());
    }

    private List<ReportsDtos.RecentRegistrationDto> recentRegistrations() {
        return registrationRepository.findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))).stream()
                .map(reg -> new ReportsDtos.RecentRegistrationDto(
                        reg.getId(),
                        reg.getEntityName(),
                        reg.getManagerName(),
                        reg.getCountry(),
                        reg.getCity(),
                        reg.getStatus().name(),
                        reg.getCreatedAt()))
                .toList();
    }

    private Table bucketTable(List<ReportsDtos.BucketDto> buckets) {
        Table table = new Table(UnitValue.createPercentArray(new float[] { 70, 30 }))
                .useAllAvailableWidth();
        addHeader(table, "Label");
        addHeader(table, "Count");
        buckets.forEach(bucket -> {
            table.addCell(bucket.getLabel());
            table.addCell(String.valueOf(bucket.getValue()));
        });
        return table;
    }

    private void addHeader(Table table, String label) {
        table.addHeaderCell(new Cell().add(new Paragraph(label).setBold()));
    }

    private void writeKpis(Workbook workbook, ReportsDtos.DashboardDto data) {
        Sheet sheet = workbook.createSheet("KPIs");
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Metric");
        header.createCell(1).setCellValue("Value");
        int rowIndex = 1;
        for (ReportsDtos.KpiDto kpi : data.getKpis()) {
            Row row = sheet.createRow(rowIndex++);
            row.createCell(0).setCellValue(kpi.getLabel());
            row.createCell(1).setCellValue(kpi.getValue());
        }
        autosize(sheet, 2);
    }

    private void writeBuckets(Workbook workbook, String sheetName, List<ReportsDtos.BucketDto> buckets) {
        Sheet sheet = workbook.createSheet(sheetName);
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Key");
        header.createCell(1).setCellValue("Label");
        header.createCell(2).setCellValue("Count");
        int rowIndex = 1;
        for (ReportsDtos.BucketDto bucket : buckets) {
            Row row = sheet.createRow(rowIndex++);
            row.createCell(0).setCellValue(bucket.getKey());
            row.createCell(1).setCellValue(bucket.getLabel());
            row.createCell(2).setCellValue(bucket.getValue());
        }
        autosize(sheet, 3);
    }

    private void writeCatalog(Workbook workbook, ReportsDtos.DashboardDto data) {
        Sheet sheet = workbook.createSheet("Catalog resources");
        Row header = sheet.createRow(0);
        List.of("Code", "Name EN", "Name AR", "Questions", "Required documents", "Active")
                .forEach(label -> header.createCell(header.getPhysicalNumberOfCells()).setCellValue(label));
        int rowIndex = 1;
        for (ReportsDtos.CategoryResourceDto category : data.getCategoryResources()) {
            Row row = sheet.createRow(rowIndex++);
            row.createCell(0).setCellValue(category.getCode());
            row.createCell(1).setCellValue(category.getNameEn());
            row.createCell(2).setCellValue(category.getNameAr());
            row.createCell(3).setCellValue(category.getQuestionCount());
            row.createCell(4).setCellValue(category.getRequiredDocumentCount());
            row.createCell(5).setCellValue(category.isActive());
        }
        autosize(sheet, 6);
    }

    private void writeValueScale(Workbook workbook, ReportsDtos.DashboardDto data) {
        Sheet sheet = workbook.createSheet("Value scale");
        Row header = sheet.createRow(0);
        List.of("Code", "Label EN", "Label AR", "Numeric score", "Active")
                .forEach(label -> header.createCell(header.getPhysicalNumberOfCells()).setCellValue(label));
        int rowIndex = 1;
        for (ReportsDtos.ValueScaleDto value : data.getValueScale()) {
            Row row = sheet.createRow(rowIndex++);
            row.createCell(0).setCellValue(value.getCode());
            row.createCell(1).setCellValue(value.getLabelEn());
            row.createCell(2).setCellValue(value.getLabelAr());
            row.createCell(3).setCellValue(value.getNumericScore().doubleValue());
            row.createCell(4).setCellValue(value.isActive());
        }
        autosize(sheet, 5);
    }

    private void writeRecentRegistrations(Workbook workbook, ReportsDtos.DashboardDto data) {
        Sheet sheet = workbook.createSheet("Recent registrations");
        Row header = sheet.createRow(0);
        List.of("ID", "Entity", "Manager", "Country", "City", "Status", "Created at")
                .forEach(label -> header.createCell(header.getPhysicalNumberOfCells()).setCellValue(label));
        int rowIndex = 1;
        for (ReportsDtos.RecentRegistrationDto registration : data.getRecentRegistrations()) {
            Row row = sheet.createRow(rowIndex++);
            row.createCell(0).setCellValue(registration.getId());
            row.createCell(1).setCellValue(registration.getEntityName());
            row.createCell(2).setCellValue(registration.getManagerName());
            row.createCell(3).setCellValue(registration.getCountry());
            row.createCell(4).setCellValue(registration.getCity());
            row.createCell(5).setCellValue(registration.getStatus());
            row.createCell(6).setCellValue(registration.getCreatedAt() == null ? "" : registration.getCreatedAt().toString());
        }
        autosize(sheet, 7);
    }

    private void autosize(Sheet sheet, int columns) {
        for (int i = 0; i < columns; i++) {
            sheet.autoSizeColumn(i);
        }
    }
}
