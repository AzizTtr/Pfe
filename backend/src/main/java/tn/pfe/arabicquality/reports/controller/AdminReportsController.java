package tn.pfe.arabicquality.reports.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.pfe.arabicquality.reports.dto.ReportsDtos;
import tn.pfe.arabicquality.reports.service.ReportsDashboardService;

import java.io.IOException;

@RestController
@RequestMapping("/admin/reports")
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
@RequiredArgsConstructor
public class AdminReportsController {

    private final ReportsDashboardService reportsDashboardService;

    @GetMapping("/dashboard")
    public ReportsDtos.DashboardDto dashboard() {
        return reportsDashboardService.dashboard();
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf() {
        return fileResponse(
                reportsDashboardService.exportPdf(),
                "advanced-reports.pdf",
                MediaType.APPLICATION_PDF);
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel() throws IOException {
        return fileResponse(
                reportsDashboardService.exportExcel(),
                "advanced-reports.xlsx",
                MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
    }

    private ResponseEntity<byte[]> fileResponse(byte[] content, String filename, MediaType mediaType) {
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filename).build().toString())
                .body(content);
    }
}
