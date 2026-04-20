import SwiftUI

// MARK: - Datenmodell fuer Menueeintraege
struct GameMenuItem: Identifiable {
    let id = UUID()
    let title: String
    let description: String
    let emoji: String
    let destination: AnyView
}

// MARK: - Hauptansicht / Startmenue
struct ContentView: View {
    // HIER ERWEITERN:
    // Neue Spiele fuegst du hinzu, indem du einen weiteren GameMenuItem-Eintrag
    // mit Titel, Beschreibung, Emoji und Zielansicht in dieses Array eintraegst.
    private let menuItems: [GameMenuItem] = [
        GameMenuItem(
            title: "Zaehler-Spiel",
            description: "Tippe auf den Button und erhoehe den Zaehler.",
            emoji: "🔢",
            destination: AnyView(CounterGameView())
        ),
        GameMenuItem(
            title: "Farbwechsel-Spiel",
            description: "Aendere die Hintergrundfarbe per Zufall.",
            emoji: "🎨",
            destination: AnyView(RandomColorGameView())
        )
    ]

    var body: some View {
        NavigationStack {
            List(menuItems) { item in
                NavigationLink {
                    item.destination
                } label: {
                    HStack(alignment: .top, spacing: 14) {
                        Text(item.emoji)
                            .font(.system(size: 40))

                        VStack(alignment: .leading, spacing: 4) {
                            Text(item.title)
                                .font(.headline)
                                .fontWeight(.bold)
                                .foregroundStyle(.primary)

                            Text(item.description)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 6)
                }
            }
            .navigationTitle("Mini-Game Hub")
        }
    }
}

// MARK: - Platzhalter-Spiel 1: Einfacher Zaehler
struct CounterGameView: View {
    @State private var count = 0

    var body: some View {
        VStack(spacing: 20) {
            Text("Aktueller Wert: \(count)")
                .font(.title2)
                .fontWeight(.semibold)

            Button("Plus 1") {
                count += 1
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
        .navigationTitle("Zaehler")
    }
}

// MARK: - Platzhalter-Spiel 2: Zufallsfarbe
struct RandomColorGameView: View {
    @State private var backgroundColor: Color = .blue.opacity(0.25)

    var body: some View {
        ZStack {
            backgroundColor
                .ignoresSafeArea()

            VStack(spacing: 16) {
                Text("Tippe den Button fuer eine neue Farbe")
                    .font(.headline)
                    .multilineTextAlignment(.center)

                Button("Farbe wechseln") {
                    backgroundColor = Color(
                        red: .random(in: 0...1),
                        green: .random(in: 0...1),
                        blue: .random(in: 0...1)
                    )
                }
                .buttonStyle(.borderedProminent)
            }
            .padding()
        }
        .navigationTitle("Farbwechsel")
    }
}

#Preview {
    ContentView()
}
