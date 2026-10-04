import re

def modify_file(filepath, changes):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in changes:
        content = content.replace(old, new)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

modify_file('src/components/dashboard/ActionModal.tsx', [
    ('import { Shield, Target, TrendingDown, Zap, MapPin } from "lucide-react";', 'import { Shield, Target, TrendingDown, MapPin } from "lucide-react";')
])

modify_file('src/components/dashboard/HabitManager.tsx', [
    ('import { Plus, Check, Settings, X, GripVertical } from "lucide-react";', 'import { Plus, Settings, GripVertical } from "lucide-react";')
])

modify_file('src/components/profile/ProfileModals.tsx', [
    ('import { UserProfile } from "../../types";\n', '')
])

modify_file('src/lib/recommendation-engine.ts', [
    ('currentFootprint: number', '_currentFootprint: number')
])

modify_file('src/pages/DetailedAnalysis.tsx', [
    ('import { ArrowLeft, ChevronLeft, Leaf, Download } from "lucide-react";', 'import { ChevronLeft, Leaf } from "lucide-react";')
])

modify_file('src/pages/FootprintBreakdown.tsx', [
    ('import { ArrowLeft, Leaf, Bus, Zap, ShoppingBag, Droplet, ArrowRight } from "lucide-react";', 'import { ArrowLeft, Leaf } from "lucide-react";'),
    ('import { ArrowLeft, ArrowRight, Leaf, Bus, Zap, ShoppingBag, Droplet } from "lucide-react";', 'import { ArrowLeft, Leaf } from "lucide-react";')
])

modify_file('src/pages/Missions.tsx', [
    ('(_, i)', '(_, _i)')
])

modify_file('src/pages/Profile.tsx', [
    ('import { User, Settings, Medal, TrendingUp, Edit2, Shield, Bell, MapPin, Mail, Calendar, MessageCircle, LogOut } from "lucide-react";', 'import { User, Settings, Medal, TrendingUp, Edit2, Shield, Bell, MapPin, Mail, Calendar, LogOut } from "lucide-react";')
])

modify_file('src/pages/Settings.tsx', [
    ('import { Card, CardContent } from "../components/ui/card";', 'import { Card } from "../components/ui/card";')
])

modify_file('src/pages/Simulator.tsx', [
    ('import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";', 'import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";'),
    ('import { ArrowLeft, Car, Train, Bus, Zap, Flame, ArrowDown, ShoppingBag, Droplet, Leaf, Plane } from "lucide-react";', 'import { ArrowLeft, Car, Bus, Zap, Flame, ShoppingBag, Droplet, Leaf } from "lucide-react";'),
    ('import { motion } from "motion/react";\n', '')
])

print('Done')
