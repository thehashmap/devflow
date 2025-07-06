package com.devflow.report.model;

public class CodeQualityMetrics {
    private int linesOfCode;
    private int cyclomaticComplexity;
    private double maintainabilityIndex;
    private int duplicatedLines;
    private int codeSmells;
    private double testCoverage;
    private String overallGrade;

    // Constructors
    public CodeQualityMetrics() {}

    // Getters and Setters
    public int getLinesOfCode() { return linesOfCode; }
    public void setLinesOfCode(int linesOfCode) { this.linesOfCode = linesOfCode; }

    public int getCyclomaticComplexity() { return cyclomaticComplexity; }
    public void setCyclomaticComplexity(int cyclomaticComplexity) { this.cyclomaticComplexity = cyclomaticComplexity; }

    public double getMaintainabilityIndex() { return maintainabilityIndex; }
    public void setMaintainabilityIndex(double maintainabilityIndex) { this.maintainabilityIndex = maintainabilityIndex; }

    public int getDuplicatedLines() { return duplicatedLines; }
    public void setDuplicatedLines(int duplicatedLines) { this.duplicatedLines = duplicatedLines; }

    public int getCodeSmells() { return codeSmells; }
    public void setCodeSmells(int codeSmells) { this.codeSmells = codeSmells; }

    public double getTestCoverage() { return testCoverage; }
    public void setTestCoverage(double testCoverage) { this.testCoverage = testCoverage; }

    public String getOverallGrade() { return overallGrade; }
    public void setOverallGrade(String overallGrade) { this.overallGrade = overallGrade; }
}