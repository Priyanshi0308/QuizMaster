const StudentSummary = {
  template: `
    <div>
      <h2 class="text-center text-primary">Student Summary</h2>

      <div v-if="quizzes.length > 0">
        <div v-if="lowScoreQuizzes.length > 0" class="alert alert-warning">
          ⚠️ You need to focus more on the following quizzes:
          <ul>
            <li v-for="quiz in lowScoreQuizzes" :key="quiz.quiz_id">
              {{ quiz.subject_name }} - {{ quiz.chapter_name }} ({{ quiz.percentage }}%)
            </li>
          </ul>
        </div>

        <table class="table table-striped">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Chapter</th>
              <th>Date</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="quiz in quizzes" :key="quiz.quiz_id">
              <td>{{ quiz.subject_name }}</td>
              <td>{{ quiz.chapter_name }}</td>
              <td>{{ quiz.date_of_quiz }}</td>
              <td>{{ quiz.total_scored }} / {{ quiz.total_questions }}</td>
              <td>{{ quiz.percentage }}%</td>
              <td>
                <span v-if="quiz.needs_improvement" class="text-danger">⚠️ Focus More</span>
                <span v-else class="text-success">✅ Good</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="text-muted text-center">No quizzes attended yet.</p>
    </div>
  `,
  data() {
    return {
      quizzes: [],
      lowScoreQuizzes: [],
    };
  },
  methods: {
    async fetchStudentSummary() {
      try {
        const response = await fetch('/api/stud-summary', {
          headers: { 
            'Content-Type': 'application/json', 
            'Authentication-Token': sessionStorage.getItem("token") 
          },
        });

        if (!response.ok) throw new Error("Failed to fetch student summary");

        const quizData = await response.json();
        this.quizzes = quizData;

        // Filter quizzes with <50% score
        this.lowScoreQuizzes = this.quizzes.filter(q => q.needs_improvement);

      } catch (error) {
        console.error("Error fetching student summary:", error);
      }
    },
  },
  mounted() {
    this.fetchStudentSummary();
  }
};

export default StudentSummary;