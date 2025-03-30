import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";

export default function Box(): JSX.Element {
  // Data for timeline cards
  const timelineCards = [
    {
      id: 1,
      title: "Тестовый текст",
      content: [
        "Тестовый текст Тестовый текст Тестовый текст",
        "Тестовый текст Тестовый текст Тестовый текст",
        "Тестовый текст Тестовый текст Тестовый текст",
      ],
      position: { top: 0, left: 0 },
    },
    {
      id: 2,
      title: "Тестовый текст",
      content: [
        "Тестовый текст Тестовый текст Тестовый текст",
        "Тестовый текст Тестовый текст Тестовый текст",
        "Тестовый текст Тестовый текст Тестовый текст",
      ],
      position: { top: "120px", left: 0 },
    },
  ];

  // Data for timeline connectors
  const connectors = [
    { id: 1, color: "bg-red-500", position: { left: "344px" } },
    { id: 2, color: "bg-yellow-400", position: { left: "364px" } },
    { id: 3, color: "bg-cyan-400", position: { left: "384px" } },
    { id: 4, color: "bg-gray-800", position: { left: "404px" } },
  ];

  return (
    <div className="relative w-full h-screen bg-gray-100">
      <div className="relative mx-auto max-w-4xl pt-16">
        {/* Timeline cards */}
        {timelineCards.map((card, index) => (
          <div key={card.id} className="relative mb-20">
            <Card className="w-[530px] bg-white rounded-md shadow-sm border border-gray-200 ml-auto">
              <CardContent className="p-4 flex items-start gap-3">
                <Avatar className="h-12 w-12 mt-1">
                  <AvatarFallback className="bg-gray-200"></AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <h3 className="font-medium text-sm mb-1">{card.title}</h3>
                  {card.content.map((line, i) => (
                    <p key={i} className="text-xs text-gray-600">
                      {line}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Connection dot at the start of the card */}
            <div className="absolute top-6 left-0 w-3 h-3 rounded-full border-2 border-white bg-gray-300"></div>

            {/* Connection dot at the end of the card */}
            <div className="absolute top-6 right-0 w-3 h-3 rounded-full bg-blue-500"></div>
          </div>
        ))}

        {/* Vertical connectors */}
        {connectors.map((connector) => (
          <div
            key={connector.id}
            className={`absolute top-[60px] ${connector.color} w-1 h-[260px]`}
            style={{ left: connector.position.left }}
          >
            {/* Connection dots on the vertical lines */}
            <div className="absolute -top-1.5 w-3 h-3 -ml-1 rounded-full border-2 border-white bg-gray-300"></div>
            <div className="absolute bottom-0 w-3 h-3 -ml-1 rounded-full border-2 border-white bg-gray-300"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
