import re

def modify_file(filepath, changes):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in changes:
        content = content.replace(old, new)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

modify_file('src/components/dashboard/FootprintPie.tsx', [
    ('import { Card, CardContent } from \'../ui/card\';', ''),
    ('import { ArrowRight, Leaf, Bus, Zap, ShoppingBag, Droplet } from \'lucide-react\';', 'import { Leaf } from \'lucide-react\';'),
    ('(entry, index)', '(_entry, index)')
])

modify_file('src/components/dashboard/HabitManager.tsx', [
    ('import { Plus, Check, Settings, X, GripVertical } from "lucide-react";', 'import { Plus, Settings, GripVertical } from "lucide-react";')
])

modify_file('src/components/layout/NotificationsPopover.tsx', [
    ('import { Bell, X, Check, Clock, ExternalLink } from \'lucide-react\';', 'import { Bell, Check, Clock, ExternalLink } from \'lucide-react\';')
])

modify_file('src/components/onboarding/Onboarding.tsx', [
    ('import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";\n', '')
])

modify_file('src/components/profile/ProfileModals.tsx', [
    ('import { UserProfile } from "../../types";\n', '')
])

modify_file('src/components/ui/scroll-area.tsx', [
    ('import * as React from "react"', 'import * as _React from "react"')
])

modify_file('src/lib/mission-engine.ts', [
    ('profile: UserProfile', '_profile: UserProfile')
])

modify_file('src/lib/recommendation-engine.ts', [
    ('currentFootprint: number', '_currentFootprint: number')
])

modify_file('src/pages/ActionPlan.tsx', [
    ('const completeAction = useAppStore(s => s.completeAction);', '')
])

modify_file('src/pages/FootprintBreakdown.tsx', [
    ('import { Card, CardContent } from "../components/ui/card";\n', ''),
    ('import { ArrowLeft, ArrowRight, Leaf, Bus, Zap, ShoppingBag, Droplet } from "lucide-react";', 'import { ArrowLeft, Leaf } from "lucide-react";'),
    ('(entry, index)', '(_entry, index)')
])

modify_file('src/pages/Insights.tsx', [
    ('import { ArrowDown, Leaf, Bus, ChevronDown, Search, Loader2, Globe, Sparkles } from "lucide-react";', 'import { ArrowDown, Bus, ChevronDown, Search, Loader2, Globe, Sparkles } from "lucide-react";')
])

modify_file('src/pages/Missions.tsx', [
    ('import { motion } from "motion/react";\n', ''),
    ('(_, i)', '(_, _i)')
])

modify_file('src/pages/Profile.tsx', [
    ('import { Card, CardContent } from "../components/ui/card";', 'import { Card } from "../components/ui/card";'),
    ('import { User, Settings, Medal, TrendingUp, Edit2, Shield, Bell, MapPin, Mail, Calendar, MessageCircle, LogOut } from "lucide-react";', 'import { User, Settings, Medal, TrendingUp, Edit2, Shield, Bell, MapPin, Mail, Calendar, LogOut } from "lucide-react";'),
    ('const carbonData = useAppStore(s => s.carbonData);\n', '')
])

modify_file('src/pages/Settings.tsx', [
    ('import { Card, CardContent } from "../components/ui/card";', 'import { Card } from "../components/ui/card";')
])

modify_file('src/pages/Simulator.tsx', [
    ('import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";', 'import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";'),
    ('import { ArrowLeft, Car, Train, Bus, Zap, Flame, ArrowDown, ShoppingBag, Droplet, Leaf, Plane } from "lucide-react";', 'import { ArrowLeft, Car, Bus, Zap, Flame, ShoppingBag, Droplet, Leaf } from "lucide-react";'),
    ('import { motion } from "motion/react";\n', '')
])

modify_file('src/pages/WhatIfSimulator.tsx', [
    ('import { ChevronLeft, Edit2, Train, Leaf, Sparkles, TrendingDown, Plus, Trash2 } from "lucide-react";', 'import { ChevronLeft, Edit2, Train, Sparkles, TrendingDown, Plus, Trash2 } from "lucide-react";')
])

modify_file('src/store.ts', [
    ('user: UserProfile', '_user: UserProfile')
])

print('Fixed unused vars!')
