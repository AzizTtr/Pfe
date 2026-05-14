package tn.pfe.arabicquality.catalog.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.pfe.arabicquality.audit.Audit;
import tn.pfe.arabicquality.catalog.domain.EvaluationCategory;
import tn.pfe.arabicquality.catalog.domain.EvaluationValue;
import tn.pfe.arabicquality.catalog.domain.Question;
import tn.pfe.arabicquality.catalog.domain.RequiredDocument;
import tn.pfe.arabicquality.catalog.dto.CatalogDtos;
import tn.pfe.arabicquality.catalog.repository.EvaluationCategoryRepository;
import tn.pfe.arabicquality.catalog.repository.EvaluationValueRepository;
import tn.pfe.arabicquality.catalog.repository.QuestionRepository;
import tn.pfe.arabicquality.catalog.repository.RequiredDocumentRepository;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class CatalogAdminService {

    private final EvaluationCategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;
    private final EvaluationValueRepository valueRepository;
    private final RequiredDocumentRepository requiredDocRepository;

    @Transactional(readOnly = true)
    public List<CatalogDtos.CategoryDto> categories() {
        return categoryRepository.findAllByOrderByDisplayOrderAscNameEnAsc().stream()
                .map(this::toCategoryDto)
                .toList();
    }

    @Transactional
    @Audit(action = "CREATE", entity = "evaluation_category", description = "Category created")
    public CatalogDtos.CategoryDto createCategory(CatalogDtos.CategorySaveDto dto) {
        if (categoryRepository.existsByCodeIgnoreCase(dto.getCode().trim())) {
            throw new IllegalStateException("Category code already exists");
        }
        EvaluationCategory category = EvaluationCategory.builder().build();
        applyCategory(category, dto);
        return toCategoryDto(categoryRepository.save(category));
    }

    @Transactional
    @Audit(action = "UPDATE", entity = "evaluation_category", description = "Category updated")
    public CatalogDtos.CategoryDto updateCategory(Long id, CatalogDtos.CategorySaveDto dto) {
        EvaluationCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Category not found: " + id));
        categoryRepository.findByCodeIgnoreCase(dto.getCode().trim())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalStateException("Category code already exists");
                });
        applyCategory(category, dto);
        return toCategoryDto(categoryRepository.save(category));
    }

    @Transactional
    @Audit(action = "DEACTIVATE", entity = "evaluation_category", description = "Category deactivated")
    public void setCategoryActive(Long id, boolean active) {
        EvaluationCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Category not found: " + id));
        category.setActive(active);
        categoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public List<CatalogDtos.QuestionDto> questions(Long categoryId) {
        List<Question> questions = categoryId == null
                ? questionRepository.findAllByOrderByDisplayOrderAscIdAsc()
                : questionRepository.findByCategoryIdOrderByDisplayOrderAscIdAsc(categoryId);
        return questions.stream().map(this::toQuestionDto).toList();
    }

    @Transactional
    @Audit(action = "CREATE", entity = "question", description = "Question created")
    public CatalogDtos.QuestionDto createQuestion(CatalogDtos.QuestionSaveDto dto) {
        Question question = Question.builder().build();
        applyQuestion(question, dto);
        return toQuestionDto(questionRepository.save(question));
    }

    @Transactional
    @Audit(action = "UPDATE", entity = "question", description = "Question updated")
    public CatalogDtos.QuestionDto updateQuestion(Long id, CatalogDtos.QuestionSaveDto dto) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Question not found: " + id));
        applyQuestion(question, dto);
        return toQuestionDto(questionRepository.save(question));
    }

    @Transactional
    @Audit(action = "DEACTIVATE", entity = "question", description = "Question deactivated")
    public void setQuestionActive(Long id, boolean active) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Question not found: " + id));
        question.setActive(active);
        questionRepository.save(question);
    }

    @Transactional(readOnly = true)
    public List<CatalogDtos.ValueDto> values() {
        return valueRepository.findAllByOrderByDisplayOrderAscCodeAsc().stream()
                .map(this::toValueDto)
                .toList();
    }

    @Transactional
    @Audit(action = "CREATE", entity = "evaluation_value", description = "Evaluation value created")
    public CatalogDtos.ValueDto createValue(CatalogDtos.ValueSaveDto dto) {
        if (valueRepository.existsByCodeIgnoreCase(dto.getCode().trim())) {
            throw new IllegalStateException("Value code already exists");
        }
        EvaluationValue value = EvaluationValue.builder().build();
        applyValue(value, dto);
        return toValueDto(valueRepository.save(value));
    }

    @Transactional
    @Audit(action = "UPDATE", entity = "evaluation_value", description = "Evaluation value updated")
    public CatalogDtos.ValueDto updateValue(Long id, CatalogDtos.ValueSaveDto dto) {
        EvaluationValue value = valueRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Value not found: " + id));
        valueRepository.findByCodeIgnoreCase(dto.getCode().trim())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalStateException("Value code already exists");
                });
        applyValue(value, dto);
        return toValueDto(valueRepository.save(value));
    }

    @Transactional
    @Audit(action = "DEACTIVATE", entity = "evaluation_value", description = "Evaluation value deactivated")
    public void setValueActive(Long id, boolean active) {
        EvaluationValue value = valueRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Value not found: " + id));
        value.setActive(active);
        valueRepository.save(value);
    }

    private void applyCategory(EvaluationCategory category, CatalogDtos.CategorySaveDto dto) {
        category.setCode(dto.getCode().trim().toUpperCase());
        category.setNameAr(dto.getNameAr().trim());
        category.setNameEn(dto.getNameEn().trim());
        category.setDescriptionAr(dto.getDescriptionAr());
        category.setDescriptionEn(dto.getDescriptionEn());
        category.setDisplayOrder(dto.getDisplayOrder());
        category.setActive(dto.getActive() == null || dto.getActive());
    }

    private void applyQuestion(Question question, CatalogDtos.QuestionSaveDto dto) {
        EvaluationCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new NoSuchElementException("Category not found: " + dto.getCategoryId()));
        question.setCategory(category);
        question.setTextAr(dto.getTextAr().trim());
        question.setTextEn(dto.getTextEn().trim());
        question.setRequiresAttachment(dto.isRequiresAttachment());
        question.setDisplayOrder(dto.getDisplayOrder());
        question.setActive(dto.getActive() == null || dto.getActive());
    }

    private void applyValue(EvaluationValue value, CatalogDtos.ValueSaveDto dto) {
        value.setCode(dto.getCode().trim().toUpperCase());
        value.setLabelAr(dto.getLabelAr().trim());
        value.setLabelEn(dto.getLabelEn().trim());
        value.setNumericScore(dto.getNumericScore());
        value.setDisplayOrder(dto.getDisplayOrder());
        value.setActive(dto.getActive() == null || dto.getActive());
    }

    private CatalogDtos.CategoryDto toCategoryDto(EvaluationCategory category) {
        return new CatalogDtos.CategoryDto(
                category.getId(), category.getCode(), category.getNameAr(), category.getNameEn(),
                category.getDescriptionAr(), category.getDescriptionEn(), category.getDisplayOrder(),
                category.isActive(), category.getQuestions() == null ? 0 : category.getQuestions().size(),
                requiredDocRepository.countByCategoryId(category.getId()));
    }

    private CatalogDtos.QuestionDto toQuestionDto(Question question) {
        EvaluationCategory category = question.getCategory();
        return new CatalogDtos.QuestionDto(
                question.getId(), category.getId(), category.getCode(), category.getNameAr(), category.getNameEn(),
                question.getTextAr(), question.getTextEn(), question.isRequiresAttachment(),
                question.getDisplayOrder(), question.isActive());
    }

    private CatalogDtos.ValueDto toValueDto(EvaluationValue value) {
        return new CatalogDtos.ValueDto(
                value.getId(), value.getCode(), value.getLabelAr(), value.getLabelEn(),
                value.getNumericScore(), value.getDisplayOrder(), value.isActive());
    }

    // ─────────────────────────────────────────────────────────────────
    //  RequiredDocuments per category
    // ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CatalogDtos.RequiredDocumentDto> requiredDocuments(Long categoryId) {
        // Ensure the category exists (404 if not)
        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NoSuchElementException("Category not found: " + categoryId));
        return requiredDocRepository.findByCategoryIdOrderByDisplayOrderAscIdAsc(categoryId)
                .stream().map(this::toRequiredDocDto).toList();
    }

    @Transactional
    @Audit(action = "CREATE", entity = "required_document", description = "Required document created")
    public CatalogDtos.RequiredDocumentDto createRequiredDocument(Long categoryId,
                                                                  CatalogDtos.RequiredDocumentSaveDto dto) {
        EvaluationCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NoSuchElementException("Category not found: " + categoryId));
        RequiredDocument doc = RequiredDocument.builder().category(category).build();
        applyRequiredDoc(doc, dto);
        return toRequiredDocDto(requiredDocRepository.save(doc));
    }

    @Transactional
    @Audit(action = "UPDATE", entity = "required_document", description = "Required document updated")
    public CatalogDtos.RequiredDocumentDto updateRequiredDocument(Long id,
                                                                  CatalogDtos.RequiredDocumentSaveDto dto) {
        RequiredDocument doc = requiredDocRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Required document not found: " + id));
        applyRequiredDoc(doc, dto);
        return toRequiredDocDto(requiredDocRepository.save(doc));
    }

    @Transactional
    @Audit(action = "DELETE", entity = "required_document", description = "Required document deleted")
    public void deleteRequiredDocument(Long id) {
        if (!requiredDocRepository.existsById(id)) {
            throw new NoSuchElementException("Required document not found: " + id);
        }
        requiredDocRepository.deleteById(id);
    }

    private void applyRequiredDoc(RequiredDocument doc, CatalogDtos.RequiredDocumentSaveDto dto) {
        doc.setLabelAr(dto.getLabelAr().trim());
        doc.setLabelEn(dto.getLabelEn().trim());
        doc.setMandatory(dto.isMandatory());
        doc.setDisplayOrder(dto.getDisplayOrder());
    }

    private CatalogDtos.RequiredDocumentDto toRequiredDocDto(RequiredDocument doc) {
        return new CatalogDtos.RequiredDocumentDto(
                doc.getId(), doc.getCategory().getId(),
                doc.getLabelAr(), doc.getLabelEn(),
                doc.isMandatory(), doc.getDisplayOrder());
    }
}
