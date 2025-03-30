const Home = {
  template: `
    <div class="home-container">
      <div class="overlay"></div>
      <div class="content">
        <h1 class="floating">Welcome to QuizMaster</h1>
        <p class="subtitle">Challenge your mind with fun and interactive quizzes!</p>
        <button class="start-btn" @click="goToDashboard">Get Started</button>
      </div>
    </div>
  `,

  methods: {
    goToDashboard() {
      if (!this.state.loggedIn) {
        this.$router.push('/user-login'); // Redirect to Login if not logged in
      } else if (this.state.role === 'admin') {
        this.$router.push('/admin-dashboard'); // Redirect to Admin Dashboard
      } else if (this.state.role === 'stud') {
        this.$router.push('/stud-dashboard'); // Redirect to Student Dashboard
      }
    }
  },

  computed: {
    state() {
      return this.$store.state; // Access Vuex state
    }
  },

  mounted() {
    document.head.insertAdjacentHTML("beforeend", `<style>${this.css}</style>`);
  },

  data() {
    return {
      css: `
        /* Full-Screen Background */
        .home-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          background: url('static/images/01bdba03df5cc55eac7228f7c0c77f23.jpg') no-repeat center center/cover;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: white;
          font-family: 'Poppins', sans-serif;
        }

        /* Dark Overlay */
        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
        }

        /* Content Box */
        .content {
          position: relative;
          z-index: 2;
          padding: 20px;
        }

        /* Floating Animation for Heading */
        .floating {
          font-size: 3rem;
          font-weight: bold;
          text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
          animation: float 3s ease-in-out infinite;
        }

        /* Subtitle Styling */
        .subtitle {
          font-size: 1.5rem;
          margin-top: 10px;
          text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
        }

        /* Start Button */
        .start-btn {
          margin-top: 20px;
          padding: 15px 30px;
          font-size: 1.2rem;
          font-weight: bold;
          color: white;
          background: linear-gradient(45deg, #ff7eb3, #ff758c);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .start-btn:hover {
          transform: scale(1.1);
          box-shadow: 0px 5px 15px rgba(255, 117, 140, 0.5);
        }

        /* Animations */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `,
    };
  },
};

export default Home;