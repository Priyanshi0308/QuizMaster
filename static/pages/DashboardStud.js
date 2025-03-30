import SearchComponent from '../components/SearchComponent.js';

const StudentDashboard = {
  template: `
    <div>
      <h2 class="text-center text-primary">Student Dashboard</h2>

      <SearchComponent :subjects="subjects" @subject-selected="selectSubject" />
      <!-- Subjects List -->
      <div class="mb-4">
        <h3 class="text-secondary">Subjects</h3>
        <ul class="list-group">
          <li 
            v-for="subject in subjects" 
            :key="subject.id" 
            class="list-group-item d-flex justify-content-between align-items-center"
            @click="selectSubject(subject)"
          >
            {{ subject.name }}
            <span class="badge bg-primary rounded-pill">{{ subject.chapters.length }} Chapters</span>
          </li>
        </ul>
      </div>

      <!-- Chapters List -->
      <div v-if="selectedSubject">
        <h3 class="text-secondary">Chapters for {{ selectedSubject.name }}</h3>
        <ul class="list-group">
          <li 
            v-for="chapter in selectedSubject.chapters" 
            :key="chapter.id" 
            class="list-group-item d-flex justify-content-between align-items-center"
            @click="selectChapter(chapter)"
          >
            {{ chapter.name }}
          </li>
        </ul>
      </div>

      <!-- Quizzes -->
      <div v-if="selectedChapter">
        <h3 class="text-secondary">Quizzes for {{ selectedChapter.name }}</h3>
        <div v-if="quizzes.length > 0">
          <div class="card shadow-sm p-4 mb-3" v-for="quiz in quizzes" :key="quiz.id">
            <div class="card-body">
              <h5 class="card-title">{{ quiz.subject_name }} - {{ quiz.chapter_name }}</h5>
              <p class="card-text"><strong>Date:</strong> {{ quiz.date_of_quiz }}</p>
              <p class="card-text"><strong>Duration:</strong> {{ quiz.time_duration }} mins</p>
              <p class="card-text text-success" v-if="scores[quiz.id] !== undefined">
                <strong>Last Score:</strong> {{ scores[quiz.id] }} / {{ questions.length }}
              </p>  
              <button class="btn btn-primary" @click="startQuiz(quiz)">Take Quiz</button>
            </div>
          </div>
        </div>
        <p v-else class="text-muted">No quizzes available for this chapter.</p>
      </div>

      <!-- Quiz Attempt Popup -->
      <div v-if="showQuizPopup" class="popup-overlay d-flex align-items-center justify-content-center">
        <div class="popup-content card shadow p-4">
          <h3 class="card-title text-center mb-3 text-primary">Quiz: {{ currentQuiz.subject_name }} - {{ currentQuiz.chapter_name }}</h3>
          <p class="text-danger text-center">Time Remaining: {{ timer }} sec</p>
      

          <div v-if="questions.length > 0">
            <div v-for="(question, index) in questions" :key="index">
              <p><strong>Q{{ index + 1 }}:</strong> {{ question.question_statement }}</p>
              <div v-for="(option, optIndex) in [question.option1, question.option2, question.option3, question.option4]" 
                  :key="optIndex" 
                  class="form-check">
                <input 
                  type="radio" 
                  :id="'option' + index + optIndex" 
                  v-model="answers[index]" 
                  :value="optIndex"
                  class="form-check-input"
                />
                <label :for="'option' + index + optIndex" class="form-check-label">{{ option }}</label>
              </div>
            </div>

            <button class="btn btn-success mt-3" @click="submitQuiz">Submit</button>
          </div>
          <p v-else class="text-center text-muted">No questions available.</p>

          <button class="btn btn-secondary mt-3" @click="closeQuizPopup">Cancel</button>
        </div>
      </div>

    </div>
  `,
  data() {
    return {
      subjects: [],
      selectedSubject: null,
      selectedChapter: null,
      quizzes: [],
      showQuizPopup: false,
      currentQuiz: null,
      questions: [],
      answers: [],
      timer: 0,
      searchQuery: "",
      filteredResults: [],
      scores: JSON.parse(sessionStorage.getItem("quizScores")) || {},
    };
  },
  computed: {
    filteredSubjects() {
      if (!this.searchQuery.trim()) return []; // Instead of returning all subjects, return empty array
      return this.subjects.filter(subject =>
        subject.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    filteredChapters() {
      if (!this.selectedSubject) return [];
      if (!this.searchQuery) return this.selectedSubject.chapters;
      return this.selectedSubject.chapters.filter(chapter =>
        chapter.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    async fetchSubjects() {
      try {
        const response = await fetch('/api/subjects', {
          headers: { 'Content-Type': 'application/json', 
            'Authentication-Token': sessionStorage.getItem("token") },
        });
        this.subjects = await response.json();
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    },
    selectSubject(subject) {
      this.selectedSubject = subject;
      this.selectedChapter = null;
    },
    async selectChapter(chapter) {
      this.selectedChapter = chapter;
      await this.fetchQuizzes(chapter.id);
    },
    async fetchQuizzes(chapterId) {
      try {
        const response = await fetch(`/api/quizzes/chapter/${chapterId}`, {
          method: "GET",
          headers: { 'Content-Type': 'application/json', 
            'Authentication-Token': sessionStorage.getItem("token") },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch quizzes");
        }
        this.quizzes = await response.json();
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        this.quizzes = [];
      }
    },
    async startQuiz(quiz) {
      this.currentQuiz = quiz;
      this.timer = quiz.time_duration * 60; // Convert minutes to seconds
      this.showQuizPopup = true;

      try {
        const response = await fetch(`/api/quizzes/${quiz.id}/questions`, {
          headers: { 'Content-Type': 'application/json', 'Authentication-Token': sessionStorage.getItem("token") },
        });
        this.questions = await response.json();
        this.answers = new Array(this.questions.length).fill(null);

        this.quizInterval = setInterval(() => {
          if (this.timer > 0) {
            this.timer--;
          } else {
            this.submitQuiz(); // Auto-submit when time runs out
          }
        }, 1000);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    },
    closeQuizPopup() {
      this.showQuizPopup = false;
      clearInterval(this.quizInterval);
    },
    async submitQuiz() {
      clearInterval(this.quizInterval);
      this.showQuizPopup = false;

      const score = this.answers.reduce((acc, ans, index) => {
        if (ans === this.questions[index].correct_option) return acc + 1;
        return acc;
      }, 0);

      alert(`Quiz submitted! Your score: ${score} / ${this.questions.length}`);

      // Save the score
      this.scores[this.currentQuiz.id] = score;
      sessionStorage.setItem("quizScores", JSON.stringify(this.scores));

      // Send the result to the backend (if needed)
      try {
        await fetch(`http://127.0.0.1:5000/api/quizzes/${this.currentQuiz.id}/submit_score`, { 
          method: "POST",
          headers: { 'Content-Type': 'application/json', 'Authentication-Token': sessionStorage.getItem("token") },
          body: JSON.stringify({ quiz_id: this.currentQuiz.id, total_scored: score}),
        });
      } catch (error) {
        console.error("Error saving quiz result:", error);
      }
    },
    async fetchScores() {
      try {
        const response = await fetch('/api/quizzes/my_scores', {
          headers: { 
            'Content-Type': 'application/json', 
            'Authentication-Token': sessionStorage.getItem("token") 
          },
        });
    
        if (!response.ok) throw new Error("Failed to fetch scores");
    
        const scoresData = await response.json();
    
        // Ensure scoresData is stored in sessionStorage for persistence
        this.scores = scoresData.reduce((acc, scoreObj) => {
          acc[scoreObj.quiz_id] = scoreObj.total_scored;  // Store only the numeric score
          return acc;
        }, {});
    
        sessionStorage.setItem("quizScores", JSON.stringify(this.scores));
      } catch (error) {
        console.error("Error fetching scores:", error);
      }
    }
    },
    selectSubject(subject) {
      this.selectedSubject = subject;
      this.selectedChapter = null; // Reset selected chapter when switching subjects
  },
  components: {
    SearchComponent,
  },
  mounted() {
    this.fetchSubjects();
    this.fetchScores();
  }
};

export default StudentDashboard;