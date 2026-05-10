package tn.pfe.arabicquality.audit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annoter une méthode de service avec @Audit pour journaliser
 * automatiquement l'exécution dans la table {@code audit_log}.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Audit {

    /** Type d'action : CREATE, UPDATE, DELETE, APPROVE, REJECT, LOGIN, EXPORT… */
    String action();

    /** Type d'entité concernée (ex : "evaluation_request"). */
    String entity() default "";

    /** Description complémentaire (peut référencer #args via SpEL). */
    String description() default "";
}
