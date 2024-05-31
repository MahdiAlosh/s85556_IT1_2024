"use strict";

//let p, v, m;
document.addEventListener("DOMContentLoaded", async function () {
  let m = new Model();
  let p = new Presenter();
  let v = new View(p);
  await m.fetchData();
  p.setModelAndView(m, v);
  //p.setTask();
});

// ############# Model ###########################################################################
class Model {
  constructor() {
    this.data;
    //this.fetchData();
  }

  // Holt eine Frage aus dem Array, zufällig ausgewählt oder vom Server
  getTask(nr) {
    return this.data[nr];
  }

  async fetchData() {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/data.json", true);
      //xhr.open("GET", "http://141.56.134.19:8000/data?id=1", true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            var data = JSON.parse(xhr.responseText);
            this.data = data;
            resolve(data);
          } else {
            reject(new Error("Failed to fetch data"));
          }
        }
      }.bind(this);
      xhr.send();
    });
  }

  async getTaskHTW() {
    const id = Math.floor(Math.random() * 123) + 1;

    const url =
      "https://idefix.informatik.htw-dresden.de:8888/api/quizzes/?page=" + id;

    return await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("test@gmail.com:secret"),
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((results) => {
        this.jsonDataExternHTW = results;
        return true;
      })
      .catch((error) => {
        console.error("Error:", error);
        return false;
      });
  }

  async checkAnswerExternHTW(id, index) {
    console.log(id, index);
    const url =
      "https://idefix.informatik.htw-dresden.de:8888/api/quizzes/" +
      id +
      "/solve";
    let answer = [];
    answer.push(index);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("test@gmail.com:secret"),
      },
      body: JSON.stringify(answer),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((results) => {
        console.log(results.feedback);
        if (results.success) {
          return 1;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        return null;
      });

    return res;
  }

  checkAnswer() {
    // TODO
  }
}

// ############ Controller ########################################################################
class Presenter {
  constructor() {
    this.right_answer = 0;
    this.currentAufgabestellung = 0;
    this.grade = 0;
  }

  setModelAndView(m, v) {
    this.m = m;
    this.v = v;
  }

  init(index) {
    this.currentAufgabestellung = index;
    this.right_answer = 0;
    this.grade = 0;
  }

  // Holt eine neue Frage aus dem Model und setzt die View
  async setTask() {
    let frag = this.m.getTask(this.currentAufgabestellung);
    if (frag.type != 3) {
      if (frag.data[this.right_answer]) {
        View.renderText(frag.data[this.right_answer].a, frag.name, frag.type);
        for (let i = 0; i < 4; i++) {
          let wert = frag.data[this.right_answer].l[i];
          this.v.inscribeButtons(i, wert, frag.type); // Tasten beschriften -> View -> Antworten
        }
        // Aktualisiere den Fortschrittsbalken basierend auf der Anzahl der beantworteten Fragen
        //this.grade = (this.right_answer / frag.data.length) * 100;
        if (this.right_answer) {
          this.grade++;
        }
        View.updateProgressBar(this.grade, frag.data.length);
      } else {
        // wiederholen für die letzte 25%
        //this.grade = (this.right_answer / frag.data.length) * 100;
        if (this.right_answer) {
          this.grade++;
        }
        if (this.grade < frag.data.length) {
          View.displayResult("Verloren....!");
          console.log("Oben!");
        } else {
          View.updateProgressBar(this.grade, frag.data.length);
          View.displayResult("Gewonnen....!");
        }
      }
    } else {
      let fetchHTW = await this.m.getTaskHTW();
      if (fetchHTW) {
        console.log(this.m.jsonDataExternHTW);
        const htwData = this.m.jsonDataExternHTW.content[this.right_answer];

        View.renderText(htwData.text, htwData.title, null);
        for (let i = 0; i < 4; i++) {
          let wert = htwData.options[i];
          this.v.inscribeButtons(i, wert, null); // Tasten beschriften -> View -> Antworten
        }
        // Aktualisiere den Fortschrittsbalken basierend auf der Anzahl der beantworteten Fragen
        //this.grade = (this.right_answer / frag.data.length) * 100;
        if (this.right_answer) {
          this.grade++;
        }
        View.updateProgressBar(
          this.grade,
          this.m.jsonDataExternHTW.content.length
        );
      }
    }
  }

  // Prüft die Antwort, aktualisiert Statistik und setzt die View
  async checkAnswer(answer, button) {
    let check = this.m.getTask(this.currentAufgabestellung);
    if (check.type != 3) {
      if (check.data[this.right_answer]) {
        // right_answer: richtige Antwort
        if (check.data[this.right_answer].r == answer) {
          // answer: aktuelle Taste[0]
          this.right_answer++;
          this.v.counter--;
          console.log("counter unten: " + this.v.counter);
          this.setTask();
        } else {
          if (this.grade > 0 || answer) {
            console.log("grade: " + this.grade);
            //this.grade -= (1 / check.data.length) * 100;
            this.grade--;
            this.grade = Math.max(0, this.grade); // Sicherstellen, dass der Fortschritt nicht unter 0 fällt
            console.log("grade: " + this.grade);
            View.updateProgressBar(this.grade, check.data.length);
            button.style.backgroundColor = "red";
          }

          console.log("counter" + this.v.counter);
          if (this.v.counter >= check.data.length) {
            View.updateProgressBar(0, check.data.length);
            View.displayResult("Verloren....!");
            console.log("Unten!");
          }
        }
      }
    } else {
      const currentDataAuggabe =
        this.m.jsonDataExternHTW.content[this.right_answer];
      console.log(currentDataAuggabe);
      const resAntwort = await this.m.checkAnswerExternHTW(
        currentDataAuggabe.id,
        answer
      );
      if (resAntwort) {
        this.right_answer++;
        this.v.counter--;
        console.log("counter unten: " + this.v.counter);
        this.setTask();
      } else {
        if (this.grade > 0 || answer) {
          console.log("grade: " + this.grade);
          //this.grade -= (1 / check.data.length) * 100;
          this.grade--;
          this.grade = Math.max(0, this.grade); // Sicherstellen, dass der Fortschritt nicht unter 0 fällt
          console.log("grade: " + this.grade);
          View.updateProgressBar(
            this.grade,
            this.m.jsonDataExternHTW.content.length
          );
          button.style.backgroundColor = "red";
        }

        console.log("counter" + this.v.counter);
        if (this.v.counter >= this.m.jsonDataExternHTW.content.length) {
          View.updateProgressBar(0, this.m.jsonDataExternHTW.content.length);
          View.displayResult("Verloren....!");
          console.log("Unten!");
        }
      }
    }
  }
}

// ##################### View #####################################################################
class View {
  constructor(p) {
    this.p = p; // Presenter
    this.setHandler();
    this.counter = 0; // außerhalb der Methode "inscribeButtons" initiallisieren
  }

  setHandler() {
    const aufgaben_container = document.getElementById("aufgaben_container");
    const ueberblick = document.getElementById("überblick");
    document.getElementById("restart").onclick = function () {
      location.reload();
    };

    Array.from(document.getElementById("navList").children).forEach(
      (child, index) => {
        //oder normal for loop
        child.onclick = () => {
          this.counter = 0; // Initiallisieren Counter auf 0 für jede List bzw. Katagorie
          this.p.init(index);
          this.p.setTask();
          //später besser in einer Funk. impl.
          ueberblick.style.display = "none";
          aufgaben_container.style.display = "block";
        };
      }
    );
  }

  inscribeButtons(i, text, type) {
    const thisbutton = document.getElementById("tasten").children[i];
    if (type == 1) {
      katex.render(text, thisbutton);
    } else {
      thisbutton.textContent = text;
    }
    thisbutton.onclick = () => {
      this.counter++; //check für Anzahl des Klickens!
      this.p.checkAnswer(i, thisbutton); // mit "this." übergeben
    };
    thisbutton.style.backgroundColor = null;
  }

  // Musik Noten
  static drawChord(chord, container) {
    var renderer = new Vex.Flow.Renderer(
      container,
      Vex.Flow.Renderer.Backends.SVG
    );
    renderer.resize(400, 200);
    var context = renderer.getContext();
    var stave = new Vex.Flow.Stave(10, 40, 300);
    stave.addClef("treble").addKeySignature("C");
    stave.setContext(context).draw();
    var notes = chord.map((note) => {
      return new Vex.Flow.StaveNote({
        clef: "treble",
        keys: [note],
        duration: "q",
      });
    });
    Vex.Flow.Formatter.FormatAndDraw(context, stave, notes);
  }

  static renderText(text, title, type) {
    let aufgabenstellung = document.getElementById("aufgabenstellung");

    if (type == 1) {
      katex.render(text, aufgabenstellung);
    } else if (type == 2) {
      aufgabenstellung.textContent = null;
      View.drawChord(text, aufgabenstellung);
    } else {
      aufgabenstellung.textContent = text;
    }

    let aufgaben_title = document.getElementById("aufgaben_title");
    aufgaben_title.textContent = title;
  }

  static displayResult(text) {
    document.getElementById("überblick").style.display = "block";
    document.getElementById("aufgaben_container").style.display = "none";
    document.getElementById("überblick").textContent = text;
  }

  static updateProgressBar(grade, max) {
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progressText");
    const progress = Math.max(0, Math.min(max, grade));
    const progressPercent = (progress / max) * 100;

    progressBar.style.width = progressPercent + "%"; // Setzen Sie die Breite auf den Fortschrittsprozentsatz
    progressBar.style.backgroundColor = "rgb(115, 194, 19)"; // Färben Sie die Fortschrittsleiste

    progressText.textContent = `Punkte: ${progress} / ${max}`;
  }
}
