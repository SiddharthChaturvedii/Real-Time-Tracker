"use client";

import { ShaderAnimation } from "@/components/ui/shader-animation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import MiniMapDemo from "../components/MiniMapDemo";

gsap.registerPlugin(ScrollTrigger);

const MAP_APP_URL = "/map";

export default function Home() {
  useEffect(() => {
    gsap.utils.toArray(".reveal").forEach((el: any) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: { trigger: el, start: "top 80%" },
        }
      );
    });
  }, []);

  return (
    <main className="text-white min-h-screen bg-black">
      {/* SHADER BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-black">
        <ShaderAnimation />
      </div>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-6xl font-bold"
        >
          Track Live Locations
          <span className="block text-cyan-300">in Realtime</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-gray-300 max-w-2xl"
        >
          Share your GPS location and watch friends move live on a shared map —
          instantly.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => (window.location.href = MAP_APP_URL)}
          className="mt-10 px-8 py-3 bg-cyan-400 hover:bg-cyan-300 transition rounded-xl text-black font-semibold"
        >
          ⚡ Open App
        </motion.button>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-8 max-w-6xl mx-auto reveal">
        <h2 className="text-center text-4xl font-bold mb-14">
          Powerful <span className="text-cyan-300">Features</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            [
              "Realtime Updates",
              "Instant GPS updates via WebSockets — no refresh needed",
            ],
            [
              "Unique Identity",
              "Each user gets a color-coded marker and name",
            ],
            ["Online Status", "See who’s online in realtime"],
            ["Works Everywhere", "Mobile, tablet, or desktop — just a browser"],
          ].map(([title, desc], i) => (
            <div
              key={i}
              className="bg-[#0b132b] p-6 rounded-2xl shadow-lg"
            >
              <p className="text-xl font-semibold">{title}</p>
              <p className="text-gray-400 mt-2">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO */}
      <section className="py-24 px-8 max-w-5xl mx-auto text-center reveal">
        <h2 className="text-4xl font-bold mb-10">
          See It <span className="text-cyan-300">In Action</span>
        </h2>

        <p className="text-gray-400 mb-6">
          Live realtime map preview — simulated demo 🚀
        </p>

        <MiniMapDemo />
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-8 text-center reveal">
        <div className="bg-[#0b132b] inline-block px-10 py-8 rounded-2xl shadow-xl">
          <h3 className="text-2xl font-bold mb-4">Ready to Track?</h3>
          <button
            onClick={() => (window.location.href = MAP_APP_URL)}
            className="px-8 py-3 bg-cyan-400 hover:bg-cyan-300 rounded-xl text-black font-semibold"
          >
            Launch App 🚀
          </button>
        </div>
      </section>
    </main>
  );
}
