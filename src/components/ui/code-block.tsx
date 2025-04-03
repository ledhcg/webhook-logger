"use client";

import React, { useEffect, useState } from "react";
import * as shiki from "shiki";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { ChevronDown } from "lucide-react";

const COMMON_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "go",
  "rust",
  "java",
  "csharp",
  "php",
  "ruby",
  "bash",
  "json",
  "html",
  "css",
  "sql",
  "xml",
  "yaml",
  "markdown",
] as const;

type CommonLanguage = (typeof COMMON_LANGUAGES)[number];

type CodeBlockProps = {
  code: string;
  language?: CommonLanguage | string;
  filename?: string;
  showLanguage?: boolean;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
  enableLanguageSwitcher?: boolean;
  availableLanguages?: Array<CommonLanguage | string>;
  onLanguageChange?: (language: string) => void;
};

export const CodeBlock = ({
  code,
  language = "typescript",
  filename,
  showLanguage = false,
  showLineNumbers = true,
  highlightLines = [],
  className,
  enableLanguageSwitcher = false,
  availableLanguages = [],
  onLanguageChange,
}: CodeBlockProps) => {
  const [highlighter, setHighlighter] = useState<shiki.Highlighter | null>(
    null
  );
  const [copied, setCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  useEffect(() => {
    const loadHighlighter = async () => {
      const highlighter = await shiki.createHighlighter({
        themes: ["github-light"],
        langs: [...COMMON_LANGUAGES, "sh"],
      });
      setHighlighter(highlighter);
    };

    loadHighlighter();
  }, []);

  const copyToClipboard = async () => {
    try {
      // First try modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success("Copied to clipboard", {
          description: "Code has been copied to clipboard",
          duration: 2000,
        });
      } else {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(code);
      }
    } catch (err) {
      console.error("Failed to copy code:", err);
      toast.error("Failed to copy", {
        description: "Please try selecting and copying the code manually",
        duration: 3000,
      });
    }

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Fallback method for clipboard functionality
  const fallbackCopyTextToClipboard = (text: string) => {
    try {
      // Create a temporary textarea
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Make it non-visible
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      // Execute the copy command
      const successful = document.execCommand("copy");
      if (successful) {
        setCopied(true);
        toast.success("Copied to clipboard", {
          description: "Code has been copied to clipboard",
          duration: 2000,
        });
      } else {
        throw new Error("Copy command was unsuccessful");
      }

      // Cleanup
      document.body.removeChild(textArea);
    } catch (err) {
      console.error("Fallback clipboard copy failed:", err);
      toast.error("Failed to copy", {
        description: "Please try selecting and copying the code manually",
        duration: 3000,
      });
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  if (!highlighter) {
    return (
      <div className="relative">
        <div
          className={cn(
            "bg-slate-50 text-slate-800 rounded-md",
            "p-4 overflow-x-auto font-mono text-sm",
            className
          )}
        >
          <pre className="whitespace-pre">{code}</pre>
        </div>
      </div>
    );
  }

  const actualLanguage = selectedLanguage === "sh" ? "bash" : selectedLanguage;
  const highlightedCode = highlighter.codeToHtml(code, {
    lang: actualLanguage,
    theme: "github-light",
  });

  // Apply line highlights by adding classes to specific lines
  let processedCode = highlightedCode;
  if (highlightLines.length > 0) {
    // Split the HTML by line
    const lines = processedCode
      .replace(/<pre.*?>([\s\S]*?)<\/pre>/, "$1")
      .split("\n");

    // Add the highlighted class to the specified lines
    const highlightedLines = lines.map((line, i) => {
      if (highlightLines.includes(i + 1)) {
        return `<span class="highlighted-line">${line}</span>`;
      }
      return line;
    });

    // Reconstruct the HTML
    processedCode = processedCode.replace(
      /<pre.*?>([\s\S]*?)<\/pre>/,
      `<pre class="shiki">${highlightedLines.join("\n")}</pre>`
    );
  }

  return (
    <div
      className={cn(
        "rounded-md border border-slate-200 overflow-hidden bg-slate-50",
        className
      )}
    >
      {/* Header with filename, language and language switcher */}
      {(filename || showLanguage || enableLanguageSwitcher) && (
        <div className="flex justify-between items-center px-4 py-2 border-b border-slate-200 bg-slate-100 text-slate-600">
          <div className="flex items-center space-x-2">
            {filename && (
              <span className="text-xs font-medium">{filename}</span>
            )}

            {enableLanguageSwitcher && availableLanguages.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs font-medium flex items-center gap-1 px-2 ml-2"
                  >
                    {actualLanguage}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {availableLanguages.map((lang) => (
                    <DropdownMenuItem
                      key={lang}
                      onClick={() => handleLanguageChange(lang as string)}
                      className={cn(
                        "text-xs cursor-pointer",
                        lang === selectedLanguage && "font-bold"
                      )}
                    >
                      {lang === "sh" ? "bash" : lang}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {showLanguage && !enableLanguageSwitcher && (
            <span className="text-xs uppercase font-medium">
              {actualLanguage}
            </span>
          )}
        </div>
      )}

      {/* Code block with line numbers */}
      <div className="relative group">
        <Button
          variant="outline"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-slate-200 focus:opacity-100 focus:ring-2 focus:ring-slate-400"
          onClick={copyToClipboard}
          aria-label="Copy code"
          type="button"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 text-slate-600" />
          )}
        </Button>

        <div
          className={cn(
            "relative",
            showLineNumbers ? "pl-12" : "pl-4",
            "pr-4 py-4 overflow-x-auto"
          )}
        >
          {showLineNumbers && (
            <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col items-end pr-2 py-4 text-xs text-slate-500 select-none border-r border-slate-200">
              {code.split("\n").map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "leading-5",
                    highlightLines.includes(i + 1) && "font-bold text-slate-700"
                  )}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          )}

          <div
            className="font-mono text-sm"
            dangerouslySetInnerHTML={{
              __html: highlightedCode
                .replace(
                  '<pre class="shiki" style="background-color: #ffffff">',
                  '<pre class="shiki">'
                )
                .replace('style="', 'style="font-family: inherit; '),
            }}
          />
        </div>
      </div>

      <style jsx global>{`
        .shiki {
          background-color: transparent !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .highlighted-line {
          display: block;
          background-color: rgba(100, 100, 255, 0.1);
          margin: 0 -1rem;
          padding: 0 1rem;
          border-left: 2px solid #3b82f6;
        }
      `}</style>
    </div>
  );
};
