package tn.pfe.arabicquality.reports.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.pfe.arabicquality.entities.domain.EducationalEntity;
import tn.pfe.arabicquality.reports.dto.ReportsDtos;
import tn.pfe.arabicquality.requests.domain.EvaluationRequest;
import tn.pfe.arabicquality.requests.domain.RequestStatus;
import tn.pfe.arabicquality.requests.repository.EvaluationRequestRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class PublicLeaderboardService {

    private final EvaluationRequestRepository requestRepository;

    @Transactional(readOnly = true)
    public List<ReportsDtos.InstitutionLeaderboardDto> topInstitutions() {
        Map<Long, List<EvaluationRequest>> requestsByEntity = requestRepository
                .findScoredRequestsWithEntity(RequestStatus.COMPLETED)
                .stream()
                .collect(Collectors.groupingBy(request -> request.getEntity().getId()));

        List<LeaderboardEntry> entries = requestsByEntity.values().stream()
                .map(this::toEntry)
                .sorted(Comparator.comparing(LeaderboardEntry::averagePercentage).reversed()
                        .thenComparing(Comparator.comparingLong(LeaderboardEntry::completedRequests).reversed())
                        .thenComparing(entry -> entry.entity().getName(), String.CASE_INSENSITIVE_ORDER))
                .limit(10)
                .toList();

        return IntStream.range(0, entries.size())
                .mapToObj(index -> entries.get(index).toDto(index + 1))
                .toList();
    }

    private LeaderboardEntry toEntry(List<EvaluationRequest> requests) {
        EducationalEntity entity = requests.get(0).getEntity();
        BigDecimal total = requests.stream()
                .map(EvaluationRequest::getFinalPercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal average = total.divide(BigDecimal.valueOf(requests.size()), 2, RoundingMode.HALF_UP);
        BigDecimal best = requests.stream()
                .map(EvaluationRequest::getFinalPercentage)
                .max(Comparator.naturalOrder())
                .orElse(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);
        return new LeaderboardEntry(0, entity, average, best, requests.size());
    }

    private record LeaderboardEntry(
            int rank,
            EducationalEntity entity,
            BigDecimal averagePercentage,
            BigDecimal bestPercentage,
        long completedRequests
    ) {
        private ReportsDtos.InstitutionLeaderboardDto toDto(int rank) {
            return new ReportsDtos.InstitutionLeaderboardDto(
                    rank,
                    entity.getName(),
                    entity.getCity(),
                    entity.getCountry(),
                    averagePercentage,
                    bestPercentage,
                    completedRequests
            );
        }
    }
}
