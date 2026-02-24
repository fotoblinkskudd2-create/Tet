import HealthKit

/// HealthKit integration for syncing weight and activity data (iOS only)
class HealthKitService {
    static let shared = HealthKitService()

    private let store = HKHealthStore()

    var isAvailable: Bool {
        HKHealthStore.isHealthDataAvailable()
    }

    func requestAuthorization() async -> Bool {
        guard isAvailable else { return false }

        let readTypes: Set<HKObjectType> = [
            HKObjectType.quantityType(forIdentifier: .bodyMass)!,
            HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
            HKObjectType.quantityType(forIdentifier: .stepCount)!,
        ]

        let writeTypes: Set<HKSampleType> = [
            HKObjectType.quantityType(forIdentifier: .bodyMass)!,
        ]

        do {
            try await store.requestAuthorization(toShare: writeTypes, read: readTypes)
            return true
        } catch {
            return false
        }
    }

    /// Reads the most recent body mass entry from HealthKit
    func getLatestWeight() async -> Double? {
        guard let type = HKQuantityType.quantityType(forIdentifier: .bodyMass) else {
            return nil
        }

        let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)
        let query = HKSampleQuery(
            sampleType: type,
            predicate: nil,
            limit: 1,
            sortDescriptors: [sortDescriptor]
        ) { _, samples, _ in }

        return await withCheckedContinuation { continuation in
            let q = HKSampleQuery(
                sampleType: type,
                predicate: nil,
                limit: 1,
                sortDescriptors: [sortDescriptor]
            ) { _, samples, _ in
                let weight = (samples?.first as? HKQuantitySample)?
                    .quantity.doubleValue(for: .gramUnit(with: .kilo))
                continuation.resume(returning: weight)
            }
            store.execute(q)
        }
    }

    /// Writes a weight entry to HealthKit
    func saveWeight(_ kg: Double, date: Date = Date()) async -> Bool {
        guard let type = HKQuantityType.quantityType(forIdentifier: .bodyMass) else {
            return false
        }

        let quantity = HKQuantity(unit: .gramUnit(with: .kilo), doubleValue: kg)
        let sample = HKQuantitySample(type: type, quantity: quantity, start: date, end: date)

        do {
            try await store.save(sample)
            return true
        } catch {
            return false
        }
    }
}
