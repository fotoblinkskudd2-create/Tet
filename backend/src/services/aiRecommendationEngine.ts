/**
 * AI Recommendation Engine for Leasing
 * Intelligently matches users with optimal leasing options based on preferences
 */

interface UserPreference {
  user_id: string;
  category_id: string;
  budget_min: number;
  budget_max: number;
  preferred_duration: number;
  priorities: Record<string, number>; // Priority scores 1-10
  usage_pattern: string;
  must_have_features: string[];
  nice_to_have_features: string[];
}

interface LeasingItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  monthly_price: number;
  deposit: number;
  min_lease_months: number;
  max_lease_months: number;
  specifications: Record<string, any>;
  provider: string;
  rating: number;
  available: boolean;
}

interface RecommendationResult {
  item_id: string;
  score: number;
  reasoning: {
    summary: string;
    pros: string[];
    cons: string[];
    perfect_for: string[];
  };
  match_details: {
    budget_fit: number;
    feature_match: number;
    priority_alignment: number;
    value_score: number;
    overall_fit: number;
  };
}

export class AIRecommendationEngine {

  /**
   * Generate intelligent recommendations for a user based on their preferences
   */
  static async generateRecommendations(
    preference: UserPreference,
    availableItems: LeasingItem[]
  ): Promise<RecommendationResult[]> {

    const recommendations: RecommendationResult[] = [];

    for (const item of availableItems) {
      // Skip unavailable items or wrong category
      if (!item.available || item.category_id !== preference.category_id) {
        continue;
      }

      // Calculate various scoring dimensions
      const budgetFit = this.calculateBudgetFit(item, preference);
      const featureMatch = this.calculateFeatureMatch(item, preference);
      const priorityAlignment = this.calculatePriorityAlignment(item, preference);
      const valueScore = this.calculateValueScore(item, preference);
      const durationCompatibility = this.calculateDurationCompatibility(item, preference);

      // Skip items that don't meet budget constraints
      if (budgetFit === 0) continue;

      // Weighted overall score
      const overallFit = (
        budgetFit * 0.25 +
        featureMatch * 0.25 +
        priorityAlignment * 0.20 +
        valueScore * 0.15 +
        durationCompatibility * 0.15
      );

      // Generate detailed reasoning
      const reasoning = this.generateReasoning(
        item,
        preference,
        { budgetFit, featureMatch, priorityAlignment, valueScore, overallFit }
      );

      recommendations.push({
        item_id: item.id,
        score: Math.round(overallFit * 100) / 100,
        reasoning,
        match_details: {
          budget_fit: Math.round(budgetFit * 100) / 100,
          feature_match: Math.round(featureMatch * 100) / 100,
          priority_alignment: Math.round(priorityAlignment * 100) / 100,
          value_score: Math.round(valueScore * 100) / 100,
          overall_fit: Math.round(overallFit * 100) / 100,
        }
      });
    }

    // Sort by score descending
    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate how well the item fits within the user's budget
   * Returns 0-100 score
   */
  private static calculateBudgetFit(item: LeasingItem, preference: UserPreference): number {
    const price = item.monthly_price;
    const { budget_min, budget_max } = preference;

    // Outside budget range
    if (price > budget_max) return 0;
    if (price < budget_min * 0.5) return 50; // Too cheap might be suspicious

    // Perfect fit in the middle of budget range
    const budgetMid = (budget_min + budget_max) / 2;
    const budgetRange = budget_max - budget_min;

    if (budgetRange === 0) {
      return price === budgetMid ? 100 : 0;
    }

    // Score based on distance from ideal price point
    const deviation = Math.abs(price - budgetMid) / budgetRange;
    return Math.max(0, 100 - (deviation * 100));
  }

  /**
   * Calculate how many important features match
   */
  private static calculateFeatureMatch(item: LeasingItem, preference: UserPreference): number {
    const specs = item.specifications;
    const mustHave = preference.must_have_features || [];
    const niceToHave = preference.nice_to_have_features || [];

    let score = 50; // Base score
    let mustHaveCount = 0;
    let mustHaveMatched = 0;
    let niceToHaveCount = 0;
    let niceToHaveMatched = 0;

    // Check must-have features
    for (const feature of mustHave) {
      mustHaveCount++;
      if (this.featureExists(specs, feature)) {
        mustHaveMatched++;
      }
    }

    // All must-haves are required
    if (mustHaveCount > 0 && mustHaveMatched < mustHaveCount) {
      return 0; // Deal breaker
    }

    // Check nice-to-have features
    for (const feature of niceToHave) {
      niceToHaveCount++;
      if (this.featureExists(specs, feature)) {
        niceToHaveMatched++;
      }
    }

    // Bonus for nice-to-haves
    if (niceToHaveCount > 0) {
      const niceBonus = (niceToHaveMatched / niceToHaveCount) * 50;
      score += niceBonus;
    }

    return Math.min(100, score);
  }

  /**
   * Check if a feature exists in specifications
   */
  private static featureExists(specs: Record<string, any>, feature: string): boolean {
    const lowerFeature = feature.toLowerCase();

    for (const [key, value] of Object.entries(specs)) {
      const lowerKey = key.toLowerCase();

      // Direct match or contains feature name
      if (lowerKey.includes(lowerFeature) || lowerFeature.includes(lowerKey)) {
        // Check if value is truthy for boolean features
        if (typeof value === 'boolean') {
          return value;
        }
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate alignment with user priorities (eco-friendly, luxury, cost-effective, etc.)
   */
  private static calculatePriorityAlignment(item: LeasingItem, preference: UserPreference): number {
    const priorities = preference.priorities || {};
    const specs = item.specifications;

    if (Object.keys(priorities).length === 0) {
      return 70; // Default score when no priorities set
    }

    let totalWeight = 0;
    let weightedScore = 0;

    for (const [priority, weight] of Object.entries(priorities)) {
      if (weight <= 0) continue;

      totalWeight += weight;
      const priorityKey = priority.toLowerCase().replace(/-/g, '_');

      // Check if this priority is reflected in specifications
      if (specs[priorityKey] !== undefined) {
        const specValue = specs[priorityKey];

        // Boolean: true = 100, false = 0
        if (typeof specValue === 'boolean') {
          weightedScore += specValue ? weight * 10 : 0;
        }
        // Number: scale 1-10 to percentage
        else if (typeof specValue === 'number') {
          weightedScore += Math.min(10, specValue) * weight;
        }
      }
    }

    if (totalWeight === 0) return 70;

    return Math.min(100, (weightedScore / totalWeight) * 10);
  }

  /**
   * Calculate value for money score
   */
  private static calculateValueScore(item: LeasingItem, preference: UserPreference): number {
    // Factors: rating, price relative to budget, specifications richness

    const ratingScore = (item.rating / 5) * 40; // Max 40 points

    // Price efficiency (cheaper within budget is better for value)
    const priceEfficiency = preference.budget_max > 0
      ? ((preference.budget_max - item.monthly_price) / preference.budget_max) * 30
      : 15;

    // Specification richness (more features = better value)
    const specCount = Object.keys(item.specifications).length;
    const specScore = Math.min(30, specCount * 3); // Max 30 points

    return Math.min(100, ratingScore + Math.max(0, priceEfficiency) + specScore);
  }

  /**
   * Check if item's lease duration options match user preference
   */
  private static calculateDurationCompatibility(item: LeasingItem, preference: UserPreference): number {
    const preferred = preference.preferred_duration;

    if (!preferred) return 70; // Default score

    // Perfect match
    if (preferred >= item.min_lease_months && preferred <= item.max_lease_months) {
      return 100;
    }

    // Outside range
    if (preferred < item.min_lease_months) {
      const diff = item.min_lease_months - preferred;
      return Math.max(0, 100 - (diff * 2));
    }

    if (preferred > item.max_lease_months) {
      const diff = preferred - item.max_lease_months;
      return Math.max(0, 100 - (diff * 2));
    }

    return 50;
  }

  /**
   * Generate human-readable reasoning for recommendation
   */
  private static generateReasoning(
    item: LeasingItem,
    preference: UserPreference,
    scores: Record<string, number>
  ): RecommendationResult['reasoning'] {

    const pros: string[] = [];
    const cons: string[] = [];
    const perfectFor: string[] = [];

    // Budget analysis
    if (scores.budgetFit > 80) {
      pros.push(`Perfekt pris innenfor budsjettet ditt (kr ${item.monthly_price}/mnd)`);
    } else if (scores.budgetFit > 50) {
      pros.push(`Akseptabel pris på kr ${item.monthly_price}/mnd`);
    } else if (scores.budgetFit < 50 && item.monthly_price <= preference.budget_max) {
      cons.push(`Litt under ditt typiske budsjettområde`);
    }

    // Feature analysis
    if (scores.featureMatch === 100) {
      pros.push(`Har alle funksjoner du ønsker deg`);
    } else if (scores.featureMatch > 80) {
      pros.push(`Oppfyller de fleste av dine ønsker`);
    } else if (scores.featureMatch < 50) {
      cons.push(`Mangler noen av ønskede funksjoner`);
    }

    // Priority analysis
    if (scores.priorityAlignment > 85) {
      pros.push(`Matcher perfekt med dine prioriteringer`);
    }

    // Value analysis
    if (scores.valueScore > 80) {
      pros.push(`Utmerket verdi for pengene med høy rating (${item.rating}/5)`);
    }

    // Specifications highlights
    const specs = item.specifications;
    if (specs.eco_friendly) {
      pros.push(`Miljøvennlig valg`);
      perfectFor.push(`miljøbevisste brukere`);
    }
    if (specs.luxury_level && specs.luxury_level >= 8) {
      pros.push(`Premium kvalitet og komfort`);
      perfectFor.push(`de som setter pris på luksus`);
    }
    if (specs.portability && specs.portability >= 9) {
      perfectFor.push(`mye reising og mobilitet`);
    }
    if (specs.performance_score && specs.performance_score >= 9) {
      perfectFor.push(`krevende oppgaver og ytelse`);
    }

    // Usage pattern matching
    if (preference.usage_pattern) {
      const pattern = preference.usage_pattern.toLowerCase();
      if (pattern.includes('daily') || pattern.includes('daglig')) {
        if (specs.city_friendly) {
          perfectFor.push(`daglig bruk i byen`);
        }
      }
      if (pattern.includes('family') || pattern.includes('familie')) {
        if (specs.seats && specs.seats >= 5) {
          perfectFor.push(`familiebruk`);
        }
      }
    }

    // Generate summary
    const summary = this.generateSummary(item, scores.overallFit, pros.length, cons.length);

    return {
      summary,
      pros: pros.length > 0 ? pros : ['God generell match for dine behov'],
      cons: cons.length > 0 ? cons : [],
      perfect_for: perfectFor.length > 0 ? perfectFor : ['generell bruk']
    };
  }

  /**
   * Generate overall summary statement
   */
  private static generateSummary(item: LeasingItem, overallScore: number, prosCount: number, consCount: number): string {
    if (overallScore >= 90) {
      return `${item.name} er et fantastisk valg for deg! Denne kombinerer perfekt pris, funksjoner og kvalitet basert på dine preferanser.`;
    } else if (overallScore >= 75) {
      return `${item.name} er et meget godt alternativ som møter de fleste av dine behov og ligger godt innenfor budsjettet.`;
    } else if (overallScore >= 60) {
      return `${item.name} er et solid valg som gir god verdi og dekker hovedbehovene dine.`;
    } else if (overallScore >= 45) {
      return `${item.name} kan fungere for deg, men det finnes muligens bedre alternativer som matcher dine preferanser tettere.`;
    } else {
      return `${item.name} er tilgjengelig, men matcher ikke optimalt med dine angivne preferanser.`;
    }
  }
}
