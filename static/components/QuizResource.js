const QuizResource = {
  template: `
    <div>
      <button class="btn btn-success mb-3" @click="openQuizPopup">Add Quiz</button>

      <div class="card shadow-sm p-4 mb-4 quiz-card" v-for="quiz in quizzes" :key="quiz.id">
        <div class="card-body">
          <h3 class="card-title text-center mb-3 text-primary">
            Quiz for {{ quiz.chapter_name }} - {{ quiz.subject_name }}
          </h3>
          <p class="card-text text-secondary">Date: {{ quiz.date_of_quiz }}</p>
          <p class="card-text text-secondary">Duration: {{ quiz.time_duration }} mins</p>
          <p class="card-text text-secondary">Remarks: {{ quiz.remarks }}</p>
        </div>
        <div class="card-footer text-muted text-end">
          <button class="btn btn-primary mt-2" @click="openQuestionPopup(quiz.id)">Add Question</button>
          <button class="btn btn-info mt-2" @click="viewQuestions(quiz.id)">View Questions</button>
          <button class="btn btn-warning mt-2" @click="editQuiz(quiz)">Edit</button>
          <button class="btn btn-danger mt-2" @click="deleteQuiz(quiz.id)">Delete</button>
        </div>
      </div>

      <!-- Quiz Popup -->
      <div v-if="showQuizPopup" class="popup-overlay d-flex align-items-center justify-content-center">
        <div class="popup-content card shadow p-4">
          <h3 class="card-title text-center mb-3 text-primary">{{ isEditingQuiz ? 'Edit' : 'Add' }} Quiz</h3>
          <form @submit.prevent="isEditingQuiz ? updateQuiz() : saveQuiz()">
            <div class="mb-3">
              <label class="form-label">Select Subject</label>
              <select v-model="selectedSubject" @change="fetchChapters" class="form-control" required>
                <option v-for="subject in subjects" :key="subject.id" :value="subject.id">{{ subject.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Select Chapter</label>
              <select v-model="quizForm.chapter_id" class="form-control" required>
                <option v-for="chapter in chapters" :key="chapter.id" :value="chapter.id">{{ chapter.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Date of Quiz</label>
              <input type="date" v-model="quizForm.date_of_quiz" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Time Duration (mins)</label>
              <input type="number" v-model="quizForm.time_duration" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Remarks</label>
              <textarea v-model="quizForm.remarks" class="form-control"></textarea>
            </div>
            <button type="submit" class="btn btn-success">{{ isEditingQuiz ? 'Update' : 'Add' }} Quiz</button>
            <button type="button" class="btn btn-secondary mt-3" @click="closeQuizPopup">Cancel</button>
          </form>
        </div>
      </div>

      <!-- Question Popup -->
      <div v-if="showQuestionPopup" class="popup-overlay d-flex align-items-center justify-content-center">
        <div class="popup-content card shadow p-4">
          <h3 class="card-title text-center mb-3 text-primary">Add Question</h3>
          <form @submit.prevent="saveQuestion">
            <div class="mb-3">
              <label class="form-label">Question</label>
              <input type="text" v-model="questionForm.text" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Options</label>
              <div v-for="(option, index) in questionForm.options" :key="index" class="form-check d-flex align-items-center">
                <input type="radio" :id="'option' + index" v-model="questionForm.correct_option" :value="index" class="form-check-input me-2" required />
                <input type="text" v-model="questionForm.options[index]" class="form-control w-75 me-2" required />
              </div>
            </div>
            <button type="submit" class="btn btn-success">Save Question</button>
            <button type="button" class="btn btn-secondary mt-3" @click="closeQuestionPopup">Cancel</button>
          </form>
        </div>
      </div>
      <!-- Questions Popup -->
      <div v-if="showQuestionsPopup" class="popup-overlay d-flex align-items-center justify-content-center">
        <div class="popup-content card shadow p-4">
          <h3 class="card-title text-center mb-3 text-primary">Quiz Questions</h3>

          <div v-if="questions.length">
            <ul class="list-group">
              <li v-for="(question, index) in questions" :key="index" class="list-group-item">
                <strong>Q{{ index + 1 }}:</strong> {{ question.question_statement }}
                <ul class="mt-2">
                  <li v-for="(option, optIndex) in [question.option1, question.option2, question.option3, question.option4]" 
                      :key="optIndex" 
                      :class="{'text-success fw-bold': optIndex === question.correct_option}">
                    {{ option }}
                  </li>
                </ul>
              </li>
            </ul>
          </div>
          <p v-else class="text-center text-muted">No questions available.</p>

          <button class="btn btn-secondary mt-3" @click="closeQuestionsPopup">Close</button>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      quizzes: [],
      subjects: [],
      chapters: [],
      questions: [],
      selectedSubject: null,
      showQuizPopup: false,
      showQuestionPopup: false,
      showQuestionsPopup:false,
      isEditingQuiz: false,
      quizForm: this.getEmptyQuizForm(),
      questionForm: this.getEmptyQuestionForm(),
      currentQuizId: null
    };
  },
  methods: {
    async fetchSubjects() {
      try {
        const response = await fetch('/api/subjects', {
          headers: { 
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem("token")
          },
        });
        this.subjects = await response.json();
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    },
    async fetchChapters() {
      if (!this.selectedSubject) return;
      try {
        const response = await fetch(`/api/subjects/${this.selectedSubject}/chapters`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem("token")
          },
        });
        this.chapters = await response.json();
      } catch (error) {
        console.error('Error fetching chapters:', error);
      }
    },
    async fetchQuizzes() {
      try {
        const response = await fetch('/api/quizzes', {
          headers: { 
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem("token")
          },
        });
        this.quizzes = await response.json();
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    },
    openQuizPopup() {
      this.quizForm = this.getEmptyQuizForm();
      this.selectedSubject = null;
      this.isEditingQuiz = false;
      this.showQuizPopup = true;
    },
    closeQuizPopup() {
      this.showQuizPopup = false;
      this.isEditingQuiz = false;
    },
    async saveQuiz() {
      try {
        await fetch('/api/quizzes', {
          method: 'POST',
          body: JSON.stringify(this.quizForm),
          headers: { 
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem("token") 
          }
        });
        this.fetchQuizzes();
        this.closeQuizPopup();
      } catch (error) {
        console.error('Error adding quiz:', error);
      }
    },
    async deleteQuiz(quizId) {
      try {
        await fetch(`/api/quizzes/${quizId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem("token")
          }
        });
        this.fetchQuizzes();
      } catch (error) {
        console.error('Error deleting quiz:', error);
      }
    },
    editQuiz(quiz) {
      this.quizForm = { ...quiz }; // Populate form with existing quiz details
      this.selectedSubject = quiz.subject_id; // Set selected subject
      this.isEditingQuiz = true; // Enable editing mode
      this.showQuizPopup = true; // Open popup
      
      // Fetch chapters for the selected subject to ensure the correct chapter list is available
      this.fetchChapters();
    },
    async updateQuiz() {
      try {
        await fetch(`/api/quizzes/${this.quizForm.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem("token"),
          },
          body: JSON.stringify(this.quizForm),
        });
        this.fetchQuizzes(); // Refresh quiz list
        this.closeQuizPopup(); // Close popup
      } catch (error) {
        console.error('Error updating quiz:', error);
      }
    },
    openQuestionPopup(quizId) {
      this.currentQuizId = quizId;
      this.questionForm = this.getEmptyQuestionForm();
      this.showQuestionPopup = true;
    },
    closeQuestionPopup() {
      this.showQuestionPopup = false;
    },
    async viewQuestions(quizId) {
      try {
        const response = await fetch(`/api/quizzes/${quizId}/questions`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem("token")
          },
        });
        this.questions = await response.json();
        this.showQuestionsPopup = true;
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    },
    closeQuestionsPopup() {
      this.showQuestionsPopup = false;
    },
    async saveQuestion() {
      try {
        const formattedQuestion = {
          quiz_id: this.currentQuizId,
          question_statement: this.questionForm.text,
          option1: this.questionForm.options[0],
          option2: this.questionForm.options[1],
          option3: this.questionForm.options[2],
          option4: this.questionForm.options[3],
          correct_option: this.questionForm.correct_option
        };

        await fetch(`/api/quizzes/${this.currentQuizId}/questions`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem("token") 
          },
          body: JSON.stringify(formattedQuestion)
        });

        this.closeQuestionPopup();
      } catch (error) {
        console.error('Error saving question:', error);
      }
    },
    getEmptyQuizForm() {
      return { chapter_id: '', subject_id: '', date_of_quiz: '', time_duration: '', remarks: '' };
    },
    getEmptyQuestionForm() {
      return { text: '', options: ['', '', '', ''], correct_option: null };
    }
  },
  mounted() {
    this.fetchSubjects();
    this.fetchQuizzes();
  }
};

export default QuizResource;