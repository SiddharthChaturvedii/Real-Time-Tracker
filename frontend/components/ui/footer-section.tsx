"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Instagram, Linkedin, Github, Send, Mail, MapPin, Phone } from "lucide-react"
import { GlowingEffect } from "./glowing-effect"
import { cn } from "@/lib/utils"

interface FooterProps {
    isDarkMode: boolean;
}

function Footerdemo({ isDarkMode }: FooterProps) {
    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const target = e.target as typeof e.target & {
            email: { value: string };
            message: { value: string };
        };
        const email = target.email.value;
        const message = target.message.value;
        const subject = encodeURIComponent("Feedback from Real-Time Tracker");
        const body = encodeURIComponent(`From: ${email}\n\nMessage:\n${message}`);
        window.location.href = `mailto:chaturvedisiddharth008@gmail.com?subject=${subject}&body=${body}`;
    }

    return (
        <footer className={cn(
            "relative border-t transition-all duration-700 overflow-hidden bg-transparent border-current/5",
            isDarkMode ? "text-white" : "text-black"
        )}>
            <div className="container mx-auto px-4 py-16 md:px-6 lg:px-8 relative z-10">
                <div className="grid gap-12 lg:grid-cols-2">

                    {/* Stay Connected & Merged Contact */}
                    <div className="relative group p-[1px] rounded-[2.5rem] h-full">
                        <GlowingEffect
                            spread={40}
                            glow={true}
                            disabled={false}
                            proximity={64}
                            inactiveZone={0.01}
                            borderWidth={1.5}
                        />
                        <div className={cn(
                            "relative p-10 rounded-[2.5rem] h-full flex flex-col backdrop-blur-md border",
                            isDarkMode ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5"
                        )}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-cyan-500/20 rounded-2xl">
                                    <Mail className="h-6 w-6 text-cyan-400" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tighter">Stay Connected</h2>
                            </div>

                            <p className="mb-8 text-muted-foreground font-medium">
                                Have questions, suggestions, or just want to say hi? Send us a message and we'll get back to you.
                            </p>

                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div className="relative">
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="Your Email"
                                        required
                                        className={cn(
                                            "bg-transparent border-current/10 focus:border-cyan-400/50 transition-all rounded-xl h-12",
                                        )}
                                    />
                                </div>
                                <div className="relative">
                                    <Textarea
                                        name="message"
                                        placeholder="Your Message or Feedback"
                                        required
                                        className={cn(
                                            "bg-transparent border-current/10 focus:border-cyan-400/50 transition-all rounded-xl min-h-[120px] resize-none",
                                        )}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-14 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    <Send className="h-5 w-5" />
                                    Send Message
                                </Button>
                            </form>

                            <div className="mt-10 pt-8 border-t border-current/5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-purple-400" />
                                    <span className="text-xs font-bold opacity-60 uppercase tracking-widest text-left">India, Global Support</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-green-400" />
                                    <span className="text-xs font-bold opacity-60 uppercase tracking-widest text-left">+91 SIDD-TRACK</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Socials & Branding */}
                    <div className="relative group p-[1px] rounded-[2.5rem] h-full">
                        <GlowingEffect
                            spread={40}
                            glow={true}
                            disabled={false}
                            proximity={64}
                            inactiveZone={0.01}
                            borderWidth={1.5}
                        />
                        <div className={cn(
                            "relative p-10 rounded-[2.5rem] h-full flex flex-col backdrop-blur-md border",
                            isDarkMode ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5"
                        )}>
                            <div className="flex-1">
                                <h3 className="mb-8 text-xl font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">Follow Our Journey</h3>
                                <div className="flex flex-wrap gap-5 mb-12">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="rounded-3xl h-16 w-16 border-2 hover:bg-current/5 hover:scale-110 transition-all duration-300"
                                                    onClick={() => window.open("https://www.instagram.com/siddharthhhhh._/?hl=en", "_blank")}
                                                >
                                                    <Instagram className="h-8 w-8" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-black text-white border-white/10">
                                                <p className="font-bold">Instagram</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="rounded-3xl h-16 w-16 border-2 hover:bg-current/5 hover:scale-110 transition-all duration-300"
                                                    onClick={() => window.open("https://www.linkedin.com/in/siddharth-chaturvedi-75772b250", "_blank")}
                                                >
                                                    <Linkedin className="h-8 w-8" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-black text-white border-white/10">
                                                <p className="font-bold">LinkedIn</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="rounded-3xl h-16 w-16 border-2 hover:bg-current/5 hover:scale-110 transition-all duration-300"
                                                    onClick={() => window.open("https://github.com/SiddharthChaturvedii", "_blank")}
                                                >
                                                    <Github className="h-8 w-8" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-black text-white border-white/10">
                                                <p className="font-bold">GitHub</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="space-y-2 opacity-30 group-hover:opacity-60 transition-opacity duration-700">
                                    <p className="text-6xl font-black tracking-tighter leading-none select-none">LIVE</p>
                                    <p className="text-6xl font-black tracking-tighter leading-none select-none">TRACK</p>
                                </div>
                            </div>

                            <div className="mt-auto pt-10">
                                <div className="flex items-center gap-4 p-6 bg-current/5 rounded-3xl border border-current/5">
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Infrastructure</p>
                                        <p className="text-sm font-bold">Node.js + WebSockets</p>
                                    </div>
                                    <div className="h-10 w-[1px] bg-current/10" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Frontend</p>
                                        <p className="text-sm font-bold">Next.js + GSAP</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="mt-20 pt-10 border-t border-current/5 flex flex-col items-center justify-between gap-8 md:flex-row">
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <p className="text-sm font-black tracking-tight underline decoration-cyan-500/50 underline-offset-4">
                            Siddharth Chaturvedi
                        </p>
                        <p className="text-[10px] opacity-40 font-bold uppercase tracking-[0.1em]">© {new Date().getFullYear()} All rights reserved.</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] opacity-40">
                        <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
                        <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
                        <a href="#" className="hover:opacity-100 transition-opacity">License</a>
                        <a href="#" className="hover:opacity-100 transition-opacity">Hiring</a>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-current/5 rounded-full border border-current/10">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.1em]">Verified Profile</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export { Footerdemo }
