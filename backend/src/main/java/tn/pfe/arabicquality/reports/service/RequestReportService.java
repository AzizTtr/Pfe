package tn.pfe.arabicquality.reports.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.pfe.arabicquality.catalog.domain.EvaluationValue;
import tn.pfe.arabicquality.requests.domain.EvaluationAnswer;
import tn.pfe.arabicquality.requests.domain.EvaluationRequest;
import tn.pfe.arabicquality.requests.domain.RequestStatus;
import tn.pfe.arabicquality.requests.repository.EvaluationAnswerRepository;
import tn.pfe.arabicquality.requests.repository.EvaluationRequestRepository;
import tn.pfe.arabicquality.users.domain.User;
import tn.pfe.arabicquality.users.repository.UserRepository;

import java.io.ByteArrayOutputStream;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class RequestReportService {

    private final EvaluationRequestRepository requestRepository;
    private final EvaluationAnswerRepository answerRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public byte[] exportForOwner(String kcId, Long requestId) {
        User user = userRepository.findByKcId(kcId)
                .orElseThrow(() -> new NoSuchElementException("Current user profile not found"));
        EvaluationRequest request = requestRepository.findByIdAndSubmittedById(requestId, user.getId())
                .orElseThrow(() -> new NoSuchElementException("Request not found: " + requestId));
        if (request.getStatus() != RequestStatus.COMPLETED) {
            throw new IllegalStateException("Final report is available only after completion");
        }
        return render(request);
    }

    private byte[] render(EvaluationRequest request) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfDocument pdf = new PdfDocument(new PdfWriter(out));
        Document document = new Document(pdf);

        document.add(new Paragraph("Arabic Quality Platform - Official Evaluation Report")
                .setBold()
                .setFontSize(16));
        document.add(new Paragraph("Request: " + request.getRequestNumber()));
        document.add(new Paragraph("Institution: " + request.getEntity().getName()));
        document.add(new Paragraph("Status: " + request.getStatus().name()));
        document.add(new Paragraph("Final score: " + value(request.getFinalScore())));
        document.add(new Paragraph("Final percentage: " + value(request.getFinalPercentage()) + "%"));

        document.add(new Paragraph("Final ratings").setBold().setMarginTop(16));
        Table table = new Table(UnitValue.createPercentArray(new float[] { 45, 15, 15, 25 }))
                .useAllAvailableWidth();
        header(table, "Question");
        header(table, "Initial");
        header(table, "Final");
        header(table, "Evaluator note");

        for (EvaluationAnswer answer : answerRepository.findByRequestIdOrderByQuestionDisplayOrderAscIdAsc(request.getId())) {
            EvaluationValue initial = answer.getInitialValue();
            EvaluationValue finalValue = answer.getFinalValue() == null ? initial : answer.getFinalValue();
            table.addCell(answer.getQuestion().getTextEn());
            table.addCell(initial == null ? "-" : initial.getCode());
            table.addCell(finalValue == null ? "-" : finalValue.getCode());
            table.addCell(answer.getEvaluatorNote() == null ? "" : answer.getEvaluatorNote());
        }
        document.add(table);
        document.close();
        return out.toByteArray();
    }

    private void header(Table table, String text) {
        table.addHeaderCell(new Cell().add(new Paragraph(text).setBold()));
    }

    private String value(Object value) {
        return value == null ? "-" : value.toString();
    }
}
