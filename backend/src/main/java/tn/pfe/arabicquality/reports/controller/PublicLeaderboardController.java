package tn.pfe.arabicquality.reports.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.pfe.arabicquality.reports.dto.ReportsDtos;
import tn.pfe.arabicquality.reports.service.PublicLeaderboardService;

import java.util.List;

@RestController
@RequestMapping("/public/leaderboard")
@RequiredArgsConstructor
public class PublicLeaderboardController {

    private final PublicLeaderboardService leaderboardService;

    @GetMapping("/institutions")
    public List<ReportsDtos.InstitutionLeaderboardDto> topInstitutions() {
        return leaderboardService.topInstitutions();
    }
}
