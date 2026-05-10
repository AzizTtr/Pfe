package tn.pfe.arabicquality.requests.domain;

/**
 * États possibles d'une demande d'évaluation.
 * Doit rester aligné sur l'ENUM de la table {@code evaluation_requests.status}.
 */
public enum RequestStatus {
    DRAFT,
    PENDING_REVIEW,
    UNDER_EVALUATION,
    INFO_REQUESTED,
    REJECTED_INITIAL,
    APPROVED_INITIAL,
    PENDING_ADMIN,
    REJECTED_ADMIN,
    APPROVED_ADMIN,
    PENDING_FIELD,
    REJECTED_FINAL,
    APPROVED_FINAL,
    COMPLETED
}
