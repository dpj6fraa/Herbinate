"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Herb = {
  id: string;
  name: string;
  scientific_name: string;
  image_url: string;
  tags: string[];
};

const API = "http://localhost:8080";

export default function HerbsPage() {
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:8080/herbs")
      .then((res) => res.json())
      .then(setHerbs);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🌿 Herbs</h1>
        <button
          onClick={() => router.push("/herbs/create")}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          + Create
        </button>
      </div>

      <div className="space-y-6">
        {herbs?.map((h) => (
          <div
            key={h.id}
            className="border rounded p-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => router.push(`/herbs/${h.id}`)}
          >
            {h.image_url && (
                <img
                  src={`${API}${h.image_url}`}
                  alt={h.name}
                  className="w-full h-48 object-cover rounded mb-3"
                />
            )}

            <p className="text-lg font-semibold">{h.name}</p>
            <p className="text-sm italic text-gray-500">
              {h.scientific_name}
            </p>

            <div className="flex gap-2 mt-3 flex-wrap">
              {h.tags?.map((t, i) => (
                <span
                  key={i}
                  className="text-xs bg-green-100 px-2 py-1 rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}