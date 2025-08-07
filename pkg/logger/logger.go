package logger

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"
)

// LogLevel represents the logging level
type LogLevel int

const (
	DEBUG LogLevel = iota
	INFO
	WARN
	ERROR
)

var (
	currentLevel LogLevel = INFO
	logger       *log.Logger
)

// Color constants for terminal output
const (
	ColorReset  = "\033[0m"
	ColorRed    = "\033[31m"
	ColorYellow = "\033[33m"
	ColorBlue   = "\033[34m"
	ColorGreen  = "\033[32m"
	ColorCyan   = "\033[36m"
)

// Init initializes the logger with the specified level
func Init(level string) {
	logger = log.New(os.Stdout, "", 0)
	SetLevel(level)
}

// SetLevel sets the logging level
func SetLevel(level string) {
	switch strings.ToLower(level) {
	case "debug":
		currentLevel = DEBUG
	case "info":
		currentLevel = INFO
	case "warn", "warning":
		currentLevel = WARN
	case "error":
		currentLevel = ERROR
	default:
		currentLevel = INFO
	}
}

// Debug logs a debug message
func Debug(message string, args ...interface{}) {
	if currentLevel <= DEBUG {
		logMessage(DEBUG, ColorCyan, "DEBUG", message, args...)
	}
}

// Info logs an info message
func Info(message string, args ...interface{}) {
	if currentLevel <= INFO {
		logMessage(INFO, ColorGreen, "INFO", message, args...)
	}
}

// Warn logs a warning message
func Warn(message string, args ...interface{}) {
	if currentLevel <= WARN {
		logMessage(WARN, ColorYellow, "WARN", message, args...)
	}
}

// Error logs an error message
func Error(message string, err error, args ...interface{}) {
	if currentLevel <= ERROR {
		if err != nil {
			args = append(args, err.Error())
			message = message + " - Error: %v"
		}
		logMessage(ERROR, ColorRed, "ERROR", message, args...)
	}
}

// logMessage is the internal logging function
func logMessage(level LogLevel, color, levelStr, message string, args ...interface{}) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	prefix := fmt.Sprintf("%s[%s] [%s]%s", color, timestamp, levelStr, ColorReset)
	
	if len(args) > 0 {
		message = fmt.Sprintf(message, args...)
	}
	
	logger.Printf("%s %s", prefix, message)
}
