"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MathurathPage() {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">Al-Ma'thurat</h1>
        <p className="text-gray-600">
          A compilation of prophetic supplications & Quranic remembrances
        </p>
        <p className="text-sm text-gray-500">
          Best recited after Fajr (morning) and Maghrib (evening) prayers
        </p>
      </div>

      {/* Web-based Content Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <BookOpen className="h-6 w-6" />
            Interactive Al-Ma'thurat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              Access the complete Al-Ma'thurat with Arabic text, transliteration, English
              translations, and audio guidance for proper recitation.
            </p>

            <div className="grid gap-3">
              <Button
                className="w-full flex items-center justify-center gap-2 h-12"
                onClick={() => window.open('https://www.mathurat.com/', '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                Open Interactive Al-Ma'thurat
              </Button>

              <div className="text-xs text-center text-gray-600">
                Opens in new tab • Arabic text with translations & audio
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-blue-200">
            <h4 className="font-medium text-blue-800 mb-3">What you'll find:</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>27 sections</strong> of Quranic verses and prophetic supplications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Arabic text</strong> with English transliteration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Audio recitations</strong> to learn proper pronunciation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>English translations</strong> to understand meanings</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* How to Use Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📖 How to use Al-Ma'thurat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">🌅 Morning (After Fajr)</h4>
              <p className="text-yellow-800">
                Recite the complete Ma'thurat after Fajr prayer to start your day with
                remembrance of Allah
              </p>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2">🌆 Evening (After Maghrib)</h4>
              <p className="text-purple-800">
                Recite the complete Ma'thurat after Maghrib prayer to conclude your day
                with divine protection
              </p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">💚 Tips for Beginners</h4>
              <ul className="text-green-800 space-y-1 mt-2">
                <li>• Start with a few sections and gradually increase</li>
                <li>• Use the audio to learn correct pronunciation</li>
                <li>• Recite with presence of heart and understanding</li>
                <li>• Be consistent - even if you start small</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📚 What's included (27 Sections)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <SectionItem
              number="1-7"
              title="Quranic Chapters"
              description="Al-Fatihah, Ayat al-Kursi, Surah al-Ikhlas, al-Falaq, al-Naas, and more"
              expanded={expandedSections["quranic"]}
              onToggle={() => toggleSection("quranic")}
            />
            <SectionItem
              number="8-27"
              title="Prophetic Supplications"
              description="Daily duas for protection, forgiveness, blessings, and spiritual strength"
              expanded={expandedSections["prophetic"]}
              onToggle={() => toggleSection("prophetic")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Back Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.back()}
      >
        Back
      </Button>
    </div>
  );
}

function SectionItem({ number, title, description, expanded, onToggle }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="text-left">
          <div className="font-medium text-gray-800">
            {number}. {title}
          </div>
          {!expanded && (
            <div className="text-xs text-gray-600 mt-1">{description}</div>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-600" />
        )}
      </button>
      {expanded && (
        <div className="p-3 bg-gray-50 border-t text-gray-700">
          {description}
        </div>
      )}
    </div>
  );
}
