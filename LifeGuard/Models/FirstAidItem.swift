import Foundation

struct FirstAidItem: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
    let category: String
    let steps: [String]
    let warnings: [String]
}

class FirstAidDatabase {
    static let items = [
        FirstAidItem(
            title: "CPR (Adult)",
            icon: "heart.circle.fill",
            category: "Life-Threatening",
            steps: [
                "Call emergency services immediately (911 or local emergency number)",
                "Place person on firm, flat surface",
                "Place heel of one hand on center of chest, other hand on top",
                "Push hard and fast: 100-120 compressions per minute",
                "Push down at least 2 inches (5 cm)",
                "After 30 compressions, give 2 rescue breaths (if trained)",
                "Continue until emergency help arrives or person shows signs of life"
            ],
            warnings: [
                "Only perform CPR if person is unresponsive and not breathing",
                "Do not stop CPR unless emergency help arrives or you're physically unable to continue"
            ]
        ),
        FirstAidItem(
            title: "Choking (Adult)",
            icon: "exclamationmark.triangle.fill",
            category: "Life-Threatening",
            steps: [
                "Ask 'Are you choking?' If they can't speak, act immediately",
                "Stand behind person and wrap arms around waist",
                "Make a fist with one hand, place above navel",
                "Grasp fist with other hand",
                "Give quick upward thrusts into abdomen",
                "Repeat until object is expelled or person becomes unconscious",
                "If unconscious, begin CPR and call emergency services"
            ],
            warnings: [
                "Do not perform abdominal thrusts on infants under 1 year",
                "Seek medical attention even if object is dislodged"
            ]
        ),
        FirstAidItem(
            title: "Severe Bleeding",
            icon: "drop.fill",
            category: "Life-Threatening",
            steps: [
                "Call emergency services if bleeding is severe",
                "Protect yourself with gloves if available",
                "Have person lie down and elevate wounded area if possible",
                "Apply direct pressure with clean cloth or bandage",
                "Maintain pressure for at least 10-15 minutes",
                "Add more bandages if blood soaks through (don't remove first one)",
                "Apply pressure to pressure point if bleeding doesn't stop",
                "Keep person warm and calm"
            ],
            warnings: [
                "Don't remove embedded objects - stabilize them instead",
                "Watch for signs of shock: pale skin, rapid breathing, weakness"
            ]
        ),
        FirstAidItem(
            title: "Heart Attack",
            icon: "heart.fill",
            category: "Life-Threatening",
            steps: [
                "Call emergency services immediately",
                "Have person sit or lie down in comfortable position",
                "Loosen tight clothing around neck and waist",
                "If person takes heart medication, help them take it",
                "If conscious and not allergic, give 325mg aspirin to chew",
                "Stay with person and monitor breathing and consciousness",
                "Be prepared to perform CPR if person becomes unconscious"
            ],
            warnings: [
                "Symptoms: chest pain/pressure, shortness of breath, nausea, cold sweats",
                "Don't delay calling emergency services",
                "Don't give aspirin if person is allergic or has bleeding disorders"
            ]
        ),
        FirstAidItem(
            title: "Stroke",
            icon: "brain.head.profile",
            category: "Life-Threatening",
            steps: [
                "Call emergency services immediately - TIME IS CRITICAL",
                "Note when symptoms started (needed for treatment)",
                "Have person lie down with head and shoulders slightly elevated",
                "Loosen constrictive clothing",
                "Don't give anything to eat or drink",
                "If unconscious, turn on side to allow drainage from mouth",
                "Monitor breathing and be prepared to perform CPR"
            ],
            warnings: [
                "FAST signs: Face drooping, Arm weakness, Speech difficulty, Time to call 911",
                "Other symptoms: sudden confusion, trouble seeing, severe headache, loss of balance"
            ]
        ),
        FirstAidItem(
            title: "Burns",
            icon: "flame.fill",
            category: "Common Injuries",
            steps: [
                "Remove person from heat source",
                "For minor burns: cool burn with cool running water for 10-20 minutes",
                "Remove jewelry and tight clothing before swelling",
                "Don't break blisters",
                "Cover with sterile, non-adhesive bandage or clean cloth",
                "Take over-the-counter pain reliever if needed",
                "For severe burns: call emergency services and cover with clean cloth"
            ],
            warnings: [
                "Don't use ice, butter, or ointments on severe burns",
                "Seek medical attention for burns larger than 3 inches, on face/hands/feet/genitals, or if deep"
            ]
        ),
        FirstAidItem(
            title: "Fractures",
            icon: "bandage.fill",
            category: "Common Injuries",
            steps: [
                "Call emergency services for severe fractures",
                "Don't try to realign the bone",
                "Immobilize injured area",
                "Apply ice packs to limit swelling (wrapped in cloth)",
                "Treat for shock: lay person down, elevate legs, keep warm",
                "For open fracture, don't push bone back in - cover with clean cloth"
            ],
            warnings: [
                "Don't move person if you suspect spine, neck, or head injury",
                "Signs: intense pain, deformity, swelling, bruising, inability to move"
            ]
        ),
        FirstAidItem(
            title: "Allergic Reaction (Anaphylaxis)",
            icon: "allergens",
            category: "Life-Threatening",
            steps: [
                "Call emergency services immediately",
                "If person has epinephrine auto-injector (EpiPen), help them use it",
                "Inject into outer thigh through clothing if needed",
                "Have person lie down with legs elevated (unless breathing is difficult)",
                "Second dose may be given after 5-15 minutes if symptoms don't improve",
                "Begin CPR if person stops breathing"
            ],
            warnings: [
                "Symptoms: difficulty breathing, swelling of face/throat, rapid pulse, dizziness, hives",
                "Even if symptoms improve, emergency medical care is still needed"
            ]
        ),
        FirstAidItem(
            title: "Seizures",
            icon: "waveform.path.ecg",
            category: "Medical Emergency",
            steps: [
                "Stay calm and time the seizure",
                "Clear area of hard or sharp objects",
                "Cushion head with something soft",
                "Turn person on their side if possible",
                "Don't hold person down or put anything in their mouth",
                "Stay with person until fully conscious",
                "Call emergency services if seizure lasts more than 5 minutes, person is injured, pregnant, or this is their first seizure"
            ],
            warnings: [
                "Never put anything in person's mouth during seizure",
                "Don't try to stop the seizure movements"
            ]
        ),
        FirstAidItem(
            title: "Poisoning",
            icon: "cross.vial.fill",
            category: "Medical Emergency",
            steps: [
                "Call Poison Control Center (1-800-222-1222 in US) or emergency services",
                "Have poison container or description ready",
                "Follow instructions from poison control",
                "Don't give anything by mouth unless told to do so",
                "If person vomits, turn head to side to prevent choking",
                "Save vomit sample if possible for analysis"
            ],
            warnings: [
                "Don't try to make person vomit unless instructed",
                "Don't give activated charcoal unless instructed by medical professional"
            ]
        ),
        FirstAidItem(
            title: "Shock",
            icon: "bolt.heart.fill",
            category: "Medical Emergency",
            steps: [
                "Call emergency services",
                "Lay person down on back",
                "Elevate legs about 12 inches (unless head, neck, or back injury suspected)",
                "Don't elevate head",
                "Keep person warm with blanket or coat",
                "Don't give anything to drink or eat",
                "Turn person on side if vomiting or bleeding from mouth"
            ],
            warnings: [
                "Signs: pale/cold/clammy skin, rapid breathing, rapid pulse, confusion, weakness",
                "Shock is life-threatening - immediate medical care needed"
            ]
        ),
        FirstAidItem(
            title: "Hypothermia",
            icon: "thermometer.snowflake",
            category: "Environmental",
            steps: [
                "Call emergency services if severe",
                "Move person to warm, dry location",
                "Remove wet clothing",
                "Warm person gradually with blankets and warm clothing",
                "Give warm non-alcoholic beverages if conscious",
                "Apply warm compresses to neck, chest, and groin",
                "Monitor breathing and be prepared for CPR"
            ],
            warnings: [
                "Don't use direct heat (heating pad, hot water) - can cause cardiac arrest",
                "Don't massage or rub the person",
                "Handle person gently - rough movement can trigger cardiac arrest"
            ]
        )
    ]

    static var categories: [String] {
        Array(Set(items.map { $0.category })).sorted()
    }
}
