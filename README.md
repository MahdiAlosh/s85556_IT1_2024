# s85556_IT1_2024

## 1. Struktur und Aufbau

Dieses Projekt besteht aus drei Hauptkomponenten: Model, Presenter und View. Diese Komponenten folgen dem Model-View-Presenter (MVP) Architektur-Muster. Im Folgenden wird die Struktur und der Aufbau des Projekts beschrieben:

### Hauptdatei

```javascript
"use strict";
document.addEventListener("DOMContentLoaded", async function () {
  let m = new Model();
  let p = new Presenter();
  let v = new View(p);
  await m.fetchData();
  p.setModelAndView(m, v);
});
```

### Klassen

- **Model**: Zuständig für die Datenverwaltung. Es lädt Daten vom Server und stellt diese für den Presenter bereit.
- **Presenter**: Agiert als Vermittler zwischen Model und View. Erhält Daten vom Model und aktualisiert die View entsprechend.
- **View**: Verantwortlich für die Darstellung der Benutzeroberfläche. Sie zeigt Daten an und leitet Benutzerinteraktionen an den Presenter weiter.

## 2. Ablauf des Codes

### Initialisierung

- Das Script wartet, bis die DOM geladen ist (`DOMContentLoaded` Event).
- Instanzen von Model, Presenter und View werden erstellt.
- Daten werden vom Model über die `fetchData` Methode geladen.
- Die Verbindung zwischen Model und View wird im Presenter hergestellt (`setModelAndView`).

### Model

- **fetchData**: Lädt Daten von einem lokalen Ordner (`/data.json` oder einer anderen URL) und speichert diese in der `data` Variable.
- **getTask**: Gibt eine spezifische Aufgabe aus den geladenen Daten zurück.
- **getTaskHTW**: Lädt eine zufällige Aufgabe von einem externen Server (`/https://idefix.informatik.htw-dresden.de:8888/api/quizzes/` + id).
- **checkAnswerExternHTW**: Überprüft die Antwort einer externen Aufgabe.

### Presenter

- **setModelAndView**: Verbindet Model und View mit dem Presenter.
- **init**: Initialisiert den aktuellen Zustand für eine neue Aufgabe.
- **setTask**: Holt eine neue Aufgabe vom Model und aktualisiert die View.
- **checkAnswer**: Überprüft die gegebene Antwort, aktualisiert den Fortschritt und die View entsprechend.

### View

- **setHandler**: Setzt Event-Handler für die Benutzerinteraktionen.
- **inscribeButtons**: Beschriftet die Antwort-Buttons und setzt ihre Event-Handler.
- **renderText**: Zeigt den Text der aktuellen Aufgabe an.
- **drawChord**: Zeichnet Musiknoten (falls die Aufgabe Musiknoten enthält).
- **displayResult**: Zeigt das Ergebnis der Aufgabe an (Gewonnen/Verloren).
- **updateProgressBar**: Aktualisiert die Fortschrittsleiste basierend auf dem aktuellen Fortschritt.

## 3. Zusammenfassung

Dieses Projekt implementiert ein Quiz- oder Aufgabenmanagementsystem unter Verwendung des Model-View-Presenter (MVP) Architektur-Musters. Die Hauptaufgabe des Systems besteht darin, Daten von einem Server abzurufen, diese Daten als Aufgaben darzustellen und Benutzereingaben zu verarbeiten.

- Der **Model** lädt und speichert die Daten.
- Der **Presenter** vermittelt zwischen Model und View und verarbeitet die Logik der Aufgaben.
- Die **View** stellt die Benutzeroberfläche dar und nimmt Benutzereingaben entgegen.

Durch diese Trennung von Verantwortlichkeiten wird der Code modular, wartbar und erweiterbar gehalten.
