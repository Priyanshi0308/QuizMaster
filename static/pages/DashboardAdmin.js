import SubjectResource from "../components/SubjectResource.js";
import QuizResource from "../components/QuizResource.js";
import SearchComponent from "../components/SearchComponent.js";

const DashBoardAdmin = {
  template: `
    <div> 
      <h1>Admin Dashboard</h1>

      <h2>Subjects</h2>
      <SubjectResource :subjects="allSubjects"/>
      
      <h2>Quizzes</h2>
      <QuizResource :quizzes="allQuizzes"/>
    </div>
  `,
  data() {
    return {
      allSubjects: [],
      allQuizzes: [],
      filteredSubjects: [],
    };
  },
  async mounted() {
    try {
      console.log("Token:", sessionStorage.getItem("token"));
      const subjectRes = await fetch(window.location.origin + "/api/subjects", {
        headers: {
          "Authentication-Token": sessionStorage.getItem("token"),
        },
      });
      this.allSubjects = await subjectRes.json();
      this.filteredSubjects = this.allSubjects; 

      const quizRes = await fetch(window.location.origin + "/api/quizzes", {
        headers: {
          "Authentication-Token": sessionStorage.getItem("token"),
        },
      });
      this.allQuizzes = await quizRes.json();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },
  methods: {
    handleSubjectSelection(selectedSubject) {
      // Filter subjects to display only the selected one
      this.filteredSubjects = this.allSubjects.filter(
        subject => subject.id === selectedSubject.id
      );
    }
  },
  components: { SubjectResource, QuizResource, SearchComponent },
};

export default DashBoardAdmin;