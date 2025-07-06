package com.devflow.report.model;

public class CodeIssue {
    private IssueSeverity severity;
    private String type;
    private String description;
    private int lineNumber;
    private String suggestion;

    // Constructors
    public CodeIssue() {}

    public CodeIssue(IssueSeverity severity, String type, String description, int lineNumber, String suggestion) {
        this.severity = severity;
        this.type = type;
        this.description = description;
        this.lineNumber = lineNumber;
        this.suggestion = suggestion;
    }

    // Getters and Setters
    public IssueSeverity getSeverity() { return severity; }
    public void setSeverity(IssueSeverity severity) { this.severity = severity; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getLineNumber() { return lineNumber; }
    public void setLineNumber(int lineNumber) { this.lineNumber = lineNumber; }

    public String getSuggestion() { return suggestion; }
    public void setSuggestion(String suggestion) { this.suggestion = suggestion; }
}