"use client";

import { useEffect, useState } from "react";
import * as kuromoji from "kuromoji";
import { Token } from "./types";
import Dialogue from "@/components/Dialogue";
import { parseSubToJson } from "@/lib/fetch-subs";
import { Sub } from "./types";
import { useQuery } from "@tanstack/react-query";


// Frieren ~ Ep 1 ~
const srt = "https://jimaku.cc/entry/729/download/%5Berai-raws-timed%5D-sousou-no-frieren-S1E01.srt";
const vtt = "https://s.megastatics.com/subtitle/9b258ea774bfd06f85f682f4fa38128e/eng-2.vtt"
const ass = "https://jimaku.cc/entry/729/download/%5BNekomoe%20kissaten%5D%20Sousou%20no%20Frieren%20%5B01%5D%5BWeb%5D.JPSC.ass";

export default function Home() {
  const { data: subs, isLoading: isPending } = useQuery({
    queryKey: ['subs'],
    queryFn: async () => {
      return await parseSubToJson({ url: srt, format: 'srt' })
    }
  })

  useEffect(() => {
    if (subs) {
      console.log(subs)
    }
  }, [subs])

  if(isPending || !subs) return <>Loading...</>

  return (
    <div className="p-4">
      <Dialogue subs={subs} />
    </div>
  );
}