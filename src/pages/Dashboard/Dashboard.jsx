import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { IconAutomation, IconDatabase, IconMessage, IconMic, IconTrending, IconSearch, IconClock, IconCheckCircle, IconArrow } from '../../components/Icons/CustomIcons';
import { FiUsers, FiFileText, FiCalendar, FiImage, FiCheckSquare, FiFilePlus, FiBarChart2 } from 'react-icons/fi';
import './Dashboard.css';

// Inline SVG previews — matches what's seeded in MongoDB
const PREVIEW_IMAGES = {
  form_automation: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
    <rect width="400" height="220" fill="#fdf8f3"/>
    <rect x="24" y="20" width="260" height="180" rx="12" fill="white" stroke="#e8e0d8" stroke-width="1.5"/>
    <rect x="40" y="36" width="120" height="10" rx="5" fill="#cf4500"/>
    <rect x="40" y="56" width="228" height="8" rx="4" fill="#e8e0d8"/>
    <rect x="40" y="72" width="180" height="8" rx="4" fill="#e8e0d8"/>
    <rect x="40" y="96" width="228" height="28" rx="6" fill="#fdf8f3" stroke="#e8e0d8" stroke-width="1"/>
    <rect x="48" y="104" width="80" height="8" rx="4" fill="#bdb2a7"/>
    <rect x="40" y="134" width="228" height="28" rx="6" fill="#fdf8f3" stroke="#e8e0d8" stroke-width="1"/>
    <rect x="48" y="142" width="120" height="8" rx="4" fill="#bdb2a7"/>
    <rect x="40" y="172" width="80" height="20" rx="10" fill="#cf4500"/>
    <rect x="48" y="178" width="64" height="8" rx="4" fill="white"/>
    <circle cx="330" cy="60" r="44" fill="#fff7f2" stroke="#cf4500" stroke-width="1.5"/>
    <path d="M316 60 l8 8 l16-16" stroke="#cf4500" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <rect x="296" y="110" width="68" height="8" rx="4" fill="#e8e0d8"/>
    <rect x="304" y="124" width="52" height="6" rx="3" fill="#e8e0d8"/>
  </svg>`,

  ai_form_generator: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
    <rect width="400" height="220" fill="#f5f8ff"/>
    <rect x="24" y="20" width="160" height="180" rx="12" fill="white" stroke="#dde4f5" stroke-width="1.5"/>
    <rect x="36" y="36" width="136" height="36" rx="8" fill="#f0f4ff" stroke="#3860be" stroke-width="1"/>
    <rect x="44" y="44" width="100" height="8" rx="4" fill="#bdb2a7"/>
    <rect x="44" y="56" width="72" height="6" rx="3" fill="#dde4f5"/>
    <rect x="36" y="80" width="136" height="8" rx="4" fill="#dde4f5"/>
    <rect x="36" y="96" width="100" height="8" rx="4" fill="#dde4f5"/>
    <rect x="36" y="116" width="136" height="24" rx="6" fill="#3860be"/>
    <rect x="44" y="122" width="80" height="8" rx="4" fill="white"/>
    <rect x="36" y="148" width="136" height="8" rx="4" fill="#dde4f5"/>
    <rect x="36" y="164" width="80" height="8" rx="4" fill="#dde4f5"/>
    <rect x="204" y="20" width="172" height="180" rx="12" fill="white" stroke="#dde4f5" stroke-width="1.5"/>
    <circle cx="290" cy="72" r="28" fill="#f0f4ff"/>
    <path d="M278 72 q12-16 24 0 q-12 16-24 0" fill="#3860be" opacity="0.3"/>
    <circle cx="290" cy="68" r="6" fill="#3860be"/>
    <path d="M280 82 q10 8 20 0" stroke="#3860be" stroke-width="2" fill="none" stroke-linecap="round"/>
    <rect x="220" y="112" width="140" height="8" rx="4" fill="#dde4f5"/>
    <rect x="220" y="128" width="100" height="8" rx="4" fill="#dde4f5"/>
    <rect x="220" y="148" width="140" height="20" rx="6" fill="#3860be"/>
    <rect x="228" y="154" width="80" height="8" rx="4" fill="white"/>
    <path d="M196 80 l8-6 v12 l-8-6z" fill="#3860be"/>
  </svg>`,

  data_extractor: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
    <rect width="400" height="220" fill="#f3faf5"/>
    <rect x="20" y="16" width="240" height="140" rx="10" fill="white" stroke="#c8e6d0" stroke-width="1.5"/>
    <rect x="20" y="16" width="240" height="28" rx="10" fill="#e8f5ec"/>
    <circle cx="36" cy="30" r="5" fill="#f87171"/>
    <circle cx="52" cy="30" r="5" fill="#fbbf24"/>
    <circle cx="68" cy="30" r="5" fill="#4ade80"/>
    <rect x="88" y="24" width="120" height="12" rx="6" fill="#c8e6d0"/>
    <rect x="32" y="56" width="216" height="8" rx="4" fill="#dde4f5"/>
    <rect x="32" y="72" width="160" height="8" rx="4" fill="#e8f5ec"/>
    <rect x="32" y="88" width="200" height="8" rx="4" fill="#dde4f5"/>
    <rect x="32" y="104" width="140" height="8" rx="4" fill="#e8f5ec"/>
    <rect x="32" y="120" width="180" height="8" rx="4" fill="#dde4f5"/>
    <path d="M260 86 l16 0 l-8 12z" fill="#4ade80"/>
    <rect x="280" y="56" width="100" height="100" rx="10" fill="white" stroke="#c8e6d0" stroke-width="1.5"/>
    <rect x="288" y="68" width="84" height="10" rx="4" fill="#4ade80" opacity="0.4"/>
    <rect x="288" y="86" width="84" height="8" rx="3" fill="#e8f5ec"/>
    <rect x="288" y="100" width="60" height="8" rx="3" fill="#e8f5ec"/>
    <rect x="288" y="114" width="84" height="8" rx="3" fill="#e8f5ec"/>
    <rect x="288" y="128" width="72" height="8" rx="3" fill="#e8f5ec"/>
    <rect x="100" y="168" width="200" height="36" rx="10" fill="white" stroke="#c8e6d0" stroke-width="1.5"/>
    <rect x="116" y="180" width="60" height="8" rx="4" fill="#4ade80"/>
    <rect x="184" y="180" width="100" height="8" rx="4" fill="#e8f5ec"/>
  </svg>`,

  social_media_bot: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
    <rect width="400" height="220" fill="#fdf5ff"/>
    <circle cx="80" cy="80" r="44" fill="white" stroke="#e9d5ff" stroke-width="1.5"/>
    <circle cx="80" cy="68" r="14" fill="#a855f7" opacity="0.3"/>
    <path d="M58 96 q22-16 44 0" fill="#a855f7" opacity="0.2"/>
    <circle cx="200" cy="52" r="44" fill="white" stroke="#e9d5ff" stroke-width="1.5"/>
    <rect x="178" y="38" width="44" height="28" rx="6" fill="#a855f7" opacity="0.15"/>
    <rect x="184" y="44" width="32" height="5" rx="2.5" fill="#a855f7" opacity="0.5"/>
    <rect x="184" y="53" width="22" height="5" rx="2.5" fill="#a855f7" opacity="0.3"/>
    <circle cx="320" cy="80" r="44" fill="white" stroke="#e9d5ff" stroke-width="1.5"/>
    <circle cx="310" cy="72" r="8" fill="#a855f7" opacity="0.3"/>
    <circle cx="330" cy="72" r="8" fill="#a855f7" opacity="0.3"/>
    <path d="M308 86 q12 8 24 0" stroke="#a855f7" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M80 124 l60-28" stroke="#e9d5ff" stroke-width="2" stroke-dasharray="4 3"/>
    <path d="M200 96 l60 8" stroke="#e9d5ff" stroke-width="2" stroke-dasharray="4 3"/>
    <rect x="80" y="148" width="240" height="52" rx="10" fill="white" stroke="#e9d5ff" stroke-width="1.5"/>
    <rect x="96" y="160" width="60" height="8" rx="4" fill="#a855f7" opacity="0.4"/>
    <rect x="96" y="174" width="180" height="6" rx="3" fill="#e9d5ff"/>
    <circle cx="300" cy="167" r="12" fill="#a855f7"/>
    <path d="M295 167 l4 4 l8-8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`,

  voice_to_text: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
    <rect width="400" height="220" fill="#fff8f5"/>
    <rect x="24" y="24" width="160" height="172" rx="12" fill="white" stroke="#fdd9c8" stroke-width="1.5"/>
    <circle cx="104" cy="72" r="24" fill="#fff0eb" stroke="#cf4500" stroke-width="1.5"/>
    <rect x="98" y="56" width="12" height="24" rx="6" fill="#cf4500"/>
    <path d="M90 76 q0 14 14 14 q14 0 14-14" stroke="#cf4500" stroke-width="2" fill="none" stroke-linecap="round"/>
    <line x1="104" y1="90" x2="104" y2="98" stroke="#cf4500" stroke-width="2"/>
    <line x1="96" y1="98" x2="112" y2="98" stroke="#cf4500" stroke-width="2" stroke-linecap="round"/>
    <rect x="36" y="112" width="136" height="8" rx="4" fill="#fdd9c8"/>
    <rect x="36" y="128" width="100" height="8" rx="4" fill="#fdd9c8"/>
    <rect x="36" y="148" width="136" height="28" rx="8" fill="#cf4500"/>
    <rect x="52" y="158" width="88" height="8" rx="4" fill="white"/>
    <path d="M204 86 l16 0 l-8 12z" fill="#cf4500"/>
    <rect x="220" y="24" width="156" height="172" rx="12" fill="white" stroke="#fdd9c8" stroke-width="1.5"/>
    <rect x="232" y="40" width="132" height="10" rx="4" fill="#fdd9c8"/>
    <rect x="232" y="58" width="132" height="6" rx="3" fill="#fdd9c8"/>
    <rect x="232" y="70" width="100" height="6" rx="3" fill="#fdd9c8"/>
    <rect x="232" y="82" width="120" height="6" rx="3" fill="#fdd9c8"/>
    <rect x="232" y="100" width="132" height="1" fill="#fdd9c8"/>
    <rect x="232" y="108" width="80" height="6" rx="3" fill="#fdd9c8"/>
    <rect x="232" y="120" width="132" height="6" rx="3" fill="#fdd9c8"/>
    <rect x="232" y="132" width="100" height="6" rx="3" fill="#fdd9c8"/>
    <rect x="232" y="148" width="132" height="1" fill="#fdd9c8"/>
    <rect x="232" y="156" width="120" height="6" rx="3" fill="#fdd9c8"/>
    <rect x="232" y="168" width="90" height="6" rx="3" fill="#fdd9c8"/>
  </svg>`,

  text_to_voice: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
    <rect width="400" height="220" fill="#f0f6ff"/>
    <rect x="24" y="24" width="168" height="172" rx="12" fill="white" stroke="#c7d9f5" stroke-width="1.5"/>
    <rect x="36" y="40" width="144" height="80" rx="8" fill="#f0f6ff"/>
    <rect x="44" y="50" width="128" height="6" rx="3" fill="#c7d9f5"/>
    <rect x="44" y="62" width="100" height="6" rx="3" fill="#c7d9f5"/>
    <rect x="44" y="74" width="120" height="6" rx="3" fill="#c7d9f5"/>
    <rect x="44" y="86" width="80" height="6" rx="3" fill="#c7d9f5"/>
    <rect x="44" y="98" width="110" height="6" rx="3" fill="#c7d9f5"/>
    <rect x="36" y="132" width="144" height="28" rx="8" fill="#3860be"/>
    <rect x="52" y="142" width="88" height="8" rx="4" fill="white"/>
    <rect x="36" y="168" width="144" height="16" rx="6" fill="#f0f6ff" stroke="#c7d9f5" stroke-width="1"/>
    <circle cx="48" cy="176" r="4" fill="#3860be"/>
    <rect x="58" y="173" width="60" height="6" rx="3" fill="#c7d9f5"/>
    <path d="M212 86 l16 0 l-8 12z" fill="#3860be"/>
    <rect x="228" y="24" width="148" height="172" rx="12" fill="white" stroke="#c7d9f5" stroke-width="1.5"/>
    <circle cx="302" cy="72" r="28" fill="#f0f6ff"/>
    <rect x="290" y="58" width="4" height="28" rx="2" fill="#3860be"/>
    <rect x="298" y="52" width="4" height="40" rx="2" fill="#3860be" opacity="0.7"/>
    <rect x="306" y="60" width="4" height="24" rx="2" fill="#3860be"/>
    <rect x="314" y="56" width="4" height="32" rx="2" fill="#3860be" opacity="0.7"/>
    <rect x="322" y="64" width="4" height="16" rx="2" fill="#3860be" opacity="0.4"/>
    <rect x="240" y="112" width="124" height="8" rx="4" fill="#c7d9f5"/>
    <rect x="240" y="128" width="80" height="6" rx="3" fill="#c7d9f5"/>
    <rect x="240" y="148" width="124" height="20" rx="8" fill="#3860be"/>
    <rect x="252" y="154" width="76" height="8" rx="4" fill="white"/>
  </svg>`,

  seo_keyword_analyzer: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
    <rect width="400" height="220" fill="#fffbf0"/>
    <rect x="24" y="20" width="352" height="100" rx="12" fill="white" stroke="#fde68a" stroke-width="1.5"/>
    <rect x="40" y="40" width="60" height="60" rx="8" fill="#fffbf0"/>
    <path d="M56 82 l8-32 l8 20 l8-12 l8 24" stroke="#f59e0b" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="116" y="44" width="120" height="8" rx="4" fill="#fde68a"/>
    <rect x="116" y="60" width="80" height="6" rx="3" fill="#fde68a"/>
    <rect x="116" y="74" width="100" height="6" rx="3" fill="#fde68a"/>
    <rect x="260" y="36" width="100" height="28" rx="8" fill="#f59e0b"/>
    <rect x="272" y="46" width="64" height="8" rx="4" fill="white"/>
    <rect x="260" y="72" width="100" height="8" rx="4" fill="#fde68a"/>
    <rect x="24" y="132" width="168" height="72" rx="12" fill="white" stroke="#fde68a" stroke-width="1.5"/>
    <rect x="36" y="148" width="60" height="8" rx="4" fill="#fde68a"/>
    <rect x="36" y="164" width="144" height="10" rx="4" fill="#fffbf0"/>
    <rect x="36" y="164" width="100" height="10" rx="4" fill="#f59e0b" opacity="0.4"/>
    <rect x="36" y="180" width="60" height="6" rx="3" fill="#fde68a"/>
    <rect x="208" y="132" width="168" height="72" rx="12" fill="white" stroke="#fde68a" stroke-width="1.5"/>
    <rect x="220" y="148" width="80" height="8" rx="4" fill="#fde68a"/>
    <circle cx="314" cy="168" r="20" fill="#fffbf0" stroke="#f59e0b" stroke-width="1.5"/>
    <path d="M307 168 q7-10 14 0 q-7 10-14 0" fill="#f59e0b" opacity="0.3"/>
    <circle cx="314" cy="165" r="4" fill="#f59e0b"/>
  </svg>`,

  group_expense_splitter: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
    <rect width="400" height="220" fill="#f0fdf7"/>
    <circle cx="100" cy="60" r="26" fill="white" stroke="#a7f3d0" stroke-width="1.5"/>
    <circle cx="100" cy="52" r="9" fill="#10b981" opacity="0.4"/>
    <path d="M84 74 q16-14 32 0" fill="#10b981" opacity="0.25"/>
    <circle cx="200" cy="40" r="26" fill="white" stroke="#a7f3d0" stroke-width="1.5"/>
    <circle cx="200" cy="32" r="9" fill="#10b981" opacity="0.4"/>
    <path d="M184 54 q16-14 32 0" fill="#10b981" opacity="0.25"/>
    <circle cx="300" cy="60" r="26" fill="white" stroke="#a7f3d0" stroke-width="1.5"/>
    <circle cx="300" cy="52" r="9" fill="#10b981" opacity="0.4"/>
    <path d="M284 74 q16-14 32 0" fill="#10b981" opacity="0.25"/>
    <path d="M120 68 l60-20" stroke="#a7f3d0" stroke-width="2" stroke-dasharray="4 3"/>
    <path d="M220 42 l60 12" stroke="#a7f3d0" stroke-width="2" stroke-dasharray="4 3"/>
    <rect x="60" y="110" width="280" height="90" rx="12" fill="white" stroke="#a7f3d0" stroke-width="1.5"/>
    <rect x="76" y="126" width="90" height="10" rx="5" fill="#10b981"/>
    <rect x="76" y="144" width="140" height="7" rx="3.5" fill="#d1fae5"/>
    <rect x="76" y="158" width="100" height="7" rx="3.5" fill="#d1fae5"/>
    <path d="M250 150 l14 14 l30-30" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <rect x="76" y="176" width="60" height="16" rx="8" fill="#10b981"/>
    <rect x="84" y="180" width="44" height="8" rx="4" fill="white"/>
  </svg>`,

  text_summarizer: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
    <rect width="400" height="220" fill="#f5f8ff"/>
    <rect x="24" y="20" width="168" height="180" rx="12" fill="white" stroke="#dde4f5" stroke-width="1.5"/>
    <rect x="36" y="36" width="144" height="8" rx="4" fill="#dde4f5"/>
    <rect x="36" y="52" width="144" height="8" rx="4" fill="#dde4f5"/>
    <rect x="36" y="68" width="100" height="8" rx="4" fill="#dde4f5"/>
    <rect x="36" y="92" width="144" height="8" rx="4" fill="#dde4f5"/>
    <rect x="36" y="108" width="144" height="8" rx="4" fill="#dde4f5"/>
    <rect x="36" y="124" width="120" height="8" rx="4" fill="#dde4f5"/>
    <rect x="36" y="148" width="144" height="8" rx="4" fill="#dde4f5"/>
    <rect x="36" y="164" width="90" height="8" rx="4" fill="#dde4f5"/>
    <path d="M204 86 l16 0 l-8 12z" fill="#3860be"/>
    <rect x="228" y="20" width="148" height="180" rx="12" fill="white" stroke="#c7d9f5" stroke-width="1.5"/>
    <circle cx="252" cy="44" r="5" fill="#3860be"/>
    <rect x="264" y="40" width="96" height="8" rx="4" fill="#3860be" opacity="0.5"/>
    <circle cx="252" cy="68" r="5" fill="#3860be"/>
    <rect x="264" y="64" width="80" height="8" rx="4" fill="#3860be" opacity="0.3"/>
    <circle cx="252" cy="92" r="5" fill="#3860be"/>
    <rect x="264" y="88" width="88" height="8" rx="4" fill="#3860be" opacity="0.3"/>
    <rect x="240" y="128" width="124" height="52" rx="8" fill="#f0f6ff"/>
    <rect x="252" y="140" width="100" height="6" rx="3" fill="#c7d9f5"/>
    <rect x="252" y="152" width="80" height="6" rx="3" fill="#c7d9f5"/>
    <rect x="252" y="164" width="60" height="6" rx="3" fill="#c7d9f5"/>
  </svg>`,

  meeting_poll: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
    <rect width="400" height="220" fill="#faf5ff"/>
    <rect x="24" y="20" width="352" height="180" rx="12" fill="white" stroke="#e9d5ff" stroke-width="1.5"/>
    <rect x="40" y="36" width="60" height="10" rx="5" fill="#8b5cf6" opacity="0.3"/>
    <rect x="112" y="36" width="60" height="10" rx="5" fill="#8b5cf6" opacity="0.3"/>
    <rect x="184" y="36" width="60" height="10" rx="5" fill="#8b5cf6" opacity="0.3"/>
    <rect x="256" y="36" width="60" height="10" rx="5" fill="#8b5cf6" opacity="0.3"/>
    <rect x="40" y="60" width="60" height="24" rx="4" fill="#8b5cf6" opacity="0.15"/>
    <rect x="112" y="60" width="60" height="24" rx="4" fill="#8b5cf6" opacity="0.65"/>
    <rect x="184" y="60" width="60" height="24" rx="4" fill="#8b5cf6" opacity="0.9"/>
    <rect x="256" y="60" width="60" height="24" rx="4" fill="#8b5cf6" opacity="0.3"/>
    <rect x="40" y="92" width="60" height="24" rx="4" fill="#8b5cf6" opacity="0.4"/>
    <rect x="112" y="92" width="60" height="24" rx="4" fill="#8b5cf6" opacity="0.2"/>
    <rect x="184" y="92" width="60" height="24" rx="4" fill="#8b5cf6" opacity="0.5"/>
    <rect x="256" y="92" width="60" height="24" rx="4" fill="#8b5cf6" opacity="0.15"/>
    <rect x="184" y="60" width="60" height="24" rx="4" fill="none" stroke="#8b5cf6" stroke-width="2.5"/>
    <path d="M198 72 l4 4 l8-8" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <rect x="40" y="140" width="336" height="44" rx="10" fill="#f5f0ff"/>
    <circle cx="60" cy="162" r="14" fill="#8b5cf6"/>
    <path d="M54 162 l4 4 l8-8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <rect x="84" y="154" width="180" height="8" rx="4" fill="#8b5cf6" opacity="0.5"/>
    <rect x="84" y="166" width="120" height="6" rx="3" fill="#8b5cf6" opacity="0.3"/>
  </svg>`,

  image_to_text: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
    <rect width="400" height="220" fill="#fdf2f8"/>
    <rect x="24" y="20" width="168" height="180" rx="12" fill="white" stroke="#fbcfe8" stroke-width="1.5"/>
    <rect x="40" y="36" width="136" height="90" rx="8" fill="#fdf2f8"/>
    <circle cx="70" cy="66" r="10" fill="#ec4899" opacity="0.4"/>
    <path d="M40 116 l30-30 l20 20 l40-40 l46 46" stroke="#ec4899" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
    <rect x="40" y="140" width="100" height="8" rx="4" fill="#fbcfe8"/>
    <rect x="40" y="156" width="136" height="8" rx="4" fill="#fbcfe8"/>
    <rect x="40" y="172" width="80" height="8" rx="4" fill="#fbcfe8"/>
    <path d="M204 86 l16 0 l-8 12z" fill="#ec4899"/>
    <rect x="228" y="20" width="148" height="180" rx="12" fill="white" stroke="#fbcfe8" stroke-width="1.5"/>
    <rect x="244" y="36" width="116" height="8" rx="4" fill="#fbcfe8"/>
    <rect x="244" y="52" width="100" height="8" rx="4" fill="#fbcfe8"/>
    <rect x="244" y="68" width="116" height="8" rx="4" fill="#fbcfe8"/>
    <rect x="244" y="84" width="90" height="8" rx="4" fill="#fbcfe8"/>
    <rect x="244" y="108" width="116" height="8" rx="4" fill="#fbcfe8"/>
    <rect x="244" y="124" width="70" height="8" rx="4" fill="#fbcfe8"/>
    <rect x="244" y="148" width="116" height="20" rx="8" fill="#ec4899"/>
    <rect x="256" y="154" width="76" height="8" rx="4" fill="white"/>
  </svg>`,

  csv_cleaner: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
    <rect width="400" height="220" fill="#ecfdf5"/>
    <rect x="24" y="20" width="168" height="180" rx="12" fill="white" stroke="#a7f3d0" stroke-width="1.5"/>
    <rect x="36" y="36" width="144" height="20" rx="4" fill="#fca5a5" opacity="0.4"/>
    <rect x="36" y="60" width="144" height="20" rx="4" fill="#fef08a" opacity="0.5"/>
    <rect x="36" y="84" width="144" height="20" rx="4" fill="#fca5a5" opacity="0.4"/>
    <rect x="36" y="108" width="70" height="20" rx="4" fill="#fef08a" opacity="0.5"/>
    <rect x="36" y="132" width="144" height="20" rx="4" fill="#fca5a5" opacity="0.4"/>
    <rect x="36" y="156" width="144" height="20" rx="4" fill="#e5e7eb"/>
    <path d="M204 86 l16 0 l-8 12z" fill="#059669"/>
    <rect x="228" y="20" width="148" height="180" rx="12" fill="white" stroke="#a7f3d0" stroke-width="1.5"/>
    <rect x="244" y="36" width="116" height="20" rx="4" fill="#a7f3d0" opacity="0.5"/>
    <rect x="244" y="60" width="116" height="20" rx="4" fill="#a7f3d0" opacity="0.5"/>
    <rect x="244" y="84" width="116" height="20" rx="4" fill="#a7f3d0" opacity="0.5"/>
    <circle cx="360" cy="46" r="12" fill="#059669"/>
    <path d="M354 46 l4 4 l8-8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <rect x="244" y="120" width="116" height="20" rx="8" fill="#059669"/>
    <rect x="256" y="126" width="76" height="8" rx="4" fill="white"/>
  </svg>`,

  doc_generator: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
    <rect width="400" height="220" fill="#ecfeff"/>
    <rect x="24" y="20" width="160" height="180" rx="12" fill="white" stroke="#a5f3fc" stroke-width="1.5"/>
    <rect x="40" y="36" width="128" height="10" rx="5" fill="#0891b2" opacity="0.4"/>
    <rect x="40" y="56" width="128" height="6" rx="3" fill="#a5f3fc"/>
    <rect x="40" y="70" width="100" height="6" rx="3" fill="#a5f3fc"/>
    <rect x="40" y="88" width="10" height="10" rx="2" fill="#0891b2" opacity="0.5"/>
    <rect x="58" y="90" width="110" height="6" rx="3" fill="#a5f3fc"/>
    <rect x="40" y="106" width="10" height="10" rx="2" fill="#0891b2" opacity="0.5"/>
    <rect x="58" y="108" width="90" height="6" rx="3" fill="#a5f3fc"/>
    <rect x="40" y="124" width="128" height="6" rx="3" fill="#a5f3fc"/>
    <rect x="40" y="138" width="128" height="6" rx="3" fill="#a5f3fc"/>
    <path d="M196 86 l16 0 l-8 12z" fill="#0891b2"/>
    <rect x="216" y="20" width="160" height="180" rx="12" fill="white" stroke="#a5f3fc" stroke-width="1.5"/>
    <rect x="232" y="36" width="128" height="130" rx="6" fill="#f0fdff"/>
    <text x="296" y="112" font-family="Arial" font-size="42" font-weight="700" fill="#0891b2" text-anchor="middle" opacity="0.6">PDF</text>
    <rect x="232" y="178" width="60" height="6" rx="3" fill="#a5f3fc"/>
  </svg>`,

  quick_poll: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
    <rect width="400" height="220" fill="#fff7ed"/>
    <rect x="24" y="20" width="352" height="180" rx="12" fill="white" stroke="#fed7aa" stroke-width="1.5"/>
    <rect x="40" y="36" width="200" height="12" rx="6" fill="#f97316" opacity="0.4"/>
    <rect x="40" y="68" width="100" height="8" rx="4" fill="#78716c"/>
    <rect x="150" y="64" width="180" height="16" rx="8" fill="#fed7aa"/>
    <rect x="150" y="64" width="130" height="16" rx="8" fill="#f97316"/>
    <rect x="40" y="98" width="100" height="8" rx="4" fill="#78716c"/>
    <rect x="150" y="94" width="180" height="16" rx="8" fill="#fed7aa"/>
    <rect x="150" y="94" width="70" height="16" rx="8" fill="#f97316" opacity="0.7"/>
    <rect x="40" y="128" width="100" height="8" rx="4" fill="#78716c"/>
    <rect x="150" y="124" width="180" height="16" rx="8" fill="#fed7aa"/>
    <rect x="150" y="124" width="36" height="16" rx="8" fill="#f97316" opacity="0.5"/>
    <rect x="40" y="160" width="120" height="22" rx="11" fill="#f97316"/>
    <rect x="52" y="167" width="80" height="8" rx="4" fill="white"/>
  </svg>`,
};

const mockTools = [
  {
    id: 1,
    title: 'Form Automation',
    description: 'Tự động hóa hoàn toàn quy trình điền và gửi Google Form với trí tuệ nhân tạo và hệ thống định tuyến thông minh.',
    icon: <IconAutomation />,
    category: 'Tự động hóa',
    status: 'active',
    route: '/tool/form-automation',
    previewKey: 'form_automation',
  },
  {
    id: 2,
    title: 'AI Form Generator',
    description: 'Tạo Google Form tự động với phân nhánh thông minh chỉ bằng một câu lệnh văn bản tiếng Việt đơn giản.',
    icon: <IconMessage />,
    category: 'AI & Machine Learning',
    status: 'active',
    route: '/tool/ai-form-generator',
    previewKey: 'ai_form_generator',
  },
  {
    id: 3,
    title: 'Data Extractor',
    description: 'Tự động quét và trích xuất bảng, danh sách dữ liệu có cấu trúc từ bất kỳ URL nào.',
    icon: <IconDatabase />,
    category: 'Dữ liệu',
    status: 'active',
    route: '/tool/data-extractor',
    previewKey: 'data_extractor',
  },
  {
    id: 4,
    title: 'Social Media Bot',
    description: 'Soạn và quản lý bài đăng cho Facebook, Zalo OA — lên lịch từ một nơi duy nhất.',
    icon: <IconMessage />,
    category: 'Tự động hóa',
    status: 'active',
    route: '/tool/social-bot',
    previewKey: 'social_media_bot',
  },
  {
    id: 5,
    title: 'Voice to Text AI',
    description: 'Chuyển đổi âm thanh cuộc họp, phỏng vấn thành văn bản có độ chính xác cao bằng mô hình Whisper.',
    icon: <IconMic />,
    category: 'AI & Machine Learning',
    status: 'active',
    route: '/tool/voice-to-text',
    previewKey: 'voice_to_text',
  },
  {
    id: 7,
    title: 'Text to Voice AI',
    description: 'Tổng hợp giọng nói tự nhiên tiếng Việt với nhiều nhân vật khác nhau bằng mô hình GPT-SoVITS.',
    icon: <IconMic />,
    category: 'AI & Machine Learning',
    status: 'active',
    route: '/tool/text-to-voice',
    previewKey: 'text_to_voice',
  },
  {
    id: 6,
    title: 'SEO Keyword Analyzer',
    description: 'Phân tích mật độ từ khóa, tối ưu hóa on-page SEO từ văn bản hoặc URL bài viết.',
    icon: <IconTrending />,
    category: 'Marketing',
    status: 'active',
    route: '/tool/seo-analyzer',
    previewKey: 'seo_keyword_analyzer',
  },
  {
    id: 9,
    title: 'Text Summarizer',
    description: 'Tóm tắt bài viết, báo cáo dài thành nội dung cốt lõi kèm điểm chính bằng AI.',
    icon: <FiFileText />,
    category: 'AI & Machine Learning',
    status: 'active',
    route: '/tool/summarizer',
    previewKey: 'text_summarizer',
  },
  {
    id: 10,
    title: 'Lịch hẹn nhóm',
    description: 'Tạo lịch hẹn, mỗi người tick khung giờ rảnh, tự động tìm giờ đông người rảnh nhất.',
    icon: <FiCalendar />,
    category: 'Tiện ích',
    status: 'active',
    route: '/meeting-create',
    previewKey: 'meeting_poll',
  },
  {
    id: 11,
    title: 'Image to Text',
    description: 'Trích văn bản từ ảnh chụp tài liệu, biển hiệu, ghi chú viết tay bằng AI.',
    icon: <FiImage />,
    category: 'AI & Machine Learning',
    status: 'active',
    route: '/tool/image-to-text',
    previewKey: 'image_to_text',
  },
  {
    id: 12,
    title: 'CSV/Excel Cleaner',
    description: 'Tự động xóa dòng trùng, khoảng trắng thừa, cột/dòng trống trong file CSV/Excel.',
    icon: <FiCheckSquare />,
    category: 'Dữ liệu',
    status: 'active',
    route: '/tool/csv-cleaner',
    previewKey: 'csv_cleaner',
  },
  {
    id: 13,
    title: 'Doc Generator',
    description: 'Tạo file Word hoặc PDF chuyên nghiệp từ văn bản có định dạng chỉ trong vài giây.',
    icon: <FiFilePlus />,
    category: 'Tự động hóa',
    status: 'active',
    route: '/tool/doc-generator',
    previewKey: 'doc_generator',
  },
  {
    id: 14,
    title: 'Poll / Vote nhanh',
    description: 'Tạo bình chọn tức thì, chia sẻ link, xem kết quả real-time — không cần đăng nhập để tham gia.',
    icon: <FiBarChart2 />,
    category: 'Tiện ích',
    status: 'active',
    route: '/poll-create',
    previewKey: 'quick_poll',
  },
  {
    id: 8,
    title: 'Chia tiền nhóm',
    description: 'Tạo nhóm chia tiền chuyến đi, mỗi người gửi số tiền đã chi, tự động tính ai cần trả ai bao nhiêu.',
    icon: <FiUsers />,
    category: 'Tiện ích',
    status: 'active',
    route: '/split-create',
    previewKey: 'group_expense_splitter',
  },
];

const categories = ['Tất cả', 'Tự động hóa', 'Dữ liệu', 'AI & Machine Learning', 'Marketing', 'Tiện ích'];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('default');
  const cardsRef = useRef([]);

  const handleMouseMove = (e, index) => {
    const card = cardsRef.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const filteredTools = mockTools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Tất cả' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTools = [...filteredTools].sort((a, b) => {
    if (sortBy === 'a-z') return a.title.localeCompare(b.title);
    if (sortBy === 'z-a') return b.title.localeCompare(a.title);
    if (sortBy === 'newest') return b.id - a.id;
    return 0;
  });

  const CardContent = ({ tool }) => (
    <>
      {/* Preview image banner */}
      {tool.previewKey && PREVIEW_IMAGES[tool.previewKey] && (
        <div
          className="tool-preview"
          dangerouslySetInnerHTML={{ __html: PREVIEW_IMAGES[tool.previewKey] }}
        />
      )}
      <div className="tool-card-body">
        <div className="tool-icon">{tool.icon}</div>
        <div className="tool-info">
          <h3>{tool.title}</h3>
          <p>{tool.description}</p>
          <div className="tool-category-tag">{tool.category}</div>
        </div>
        <div className="tool-footer">
          {tool.status === 'active' ? (
            <>
              <div className="tool-status status-active">
                <IconCheckCircle /> Đang hoạt động
              </div>
              <div className="tool-action">
                Sử dụng <IconArrow />
              </div>
            </>
          ) : (
            <div className="tool-status status-upcoming">
              <IconClock /> Sắp ra mắt
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="tools-directory animate-slide-up">
      <div className="dot-grid-bg"></div>
      <div className="aurora-bg"></div>

      <div className="tools-header">
        <h1>Các Công Cụ</h1>
        <p>Khám phá bộ công cụ mạnh mẽ giúp tự động hóa quy trình làm việc và tối ưu hóa thời gian của bạn.</p>
      </div>

      <div className="tools-controls">
        <div className="search-bar-wrapper">
          <input
            type="text"
            placeholder="Tìm kiếm công cụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="tools-search-input"
          />
        </div>

        <div className="filters-row">
          <div className="categories-filter">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="sort-filter">
            <span className="sort-label">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="default">Mặc định</option>
              <option value="a-z">Từ A - Z</option>
              <option value="z-a">Từ Z - A</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>
        </div>
      </div>

      <div className="tools-grid">
        {sortedTools.length > 0 ? (
          sortedTools.map((tool, idx) => (
            <div key={tool.id} className="tool-card-wrapper">
              {tool.status === 'active' ? (
                <Link
                  to={tool.route}
                  className="tool-card"
                  ref={(el) => (cardsRef.current[idx] = el)}
                  onMouseMove={(e) => handleMouseMove(e, idx)}
                >
                  <CardContent tool={tool} />
                </Link>
              ) : (
                <div
                  className="tool-card tool-card--disabled"
                  ref={(el) => (cardsRef.current[idx] = el)}
                  onMouseMove={(e) => handleMouseMove(e, idx)}
                >
                  <CardContent tool={tool} />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-tools-found">
            <IconSearch className="no-tools-icon" />
            <h3>Không tìm thấy công cụ</h3>
            <p>Không có công cụ nào phù hợp với từ khóa "{searchQuery}"</p>
            <button className="mc-btn-secondary" onClick={() => { setSearchQuery(''); setActiveCategory('Tất cả'); }}>
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
