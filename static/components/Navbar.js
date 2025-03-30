const Navbar = {
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-gradient shadow px-4 py-2">
      <div class="container-fluid">
        <router-link class="navbar-brand fs-4 fw-bold" to="/">QuizMaster</router-link>

        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link class="nav-link" to="/">Home</router-link>
            </li>
            <li class="nav-item" v-if="!state.loggedIn">
              <router-link class="nav-link" to="/user-login">Login</router-link>
            </li>
            <li class="nav-item" v-if="!state.loggedIn">
              <router-link class="nav-link" to="/signup">Signup</router-link>
            </li>

            <!-- Student Links -->
            <template v-if="state.loggedIn && state.role === 'stud'">
              <li class="nav-item">
                <router-link class="nav-link" to="/stud-dashboard">Dashboard</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/stud-summary">Summary</router-link>
              </li>
              <li class="nav-item" v-if="state.loggedIn">
              <router-link class="nav-link" to="/profile">Profile</router-link>
              </li>
            </template>

            <!-- Admin Links -->
            <template v-if="state.loggedIn && state.role === 'admin'">
              <li class="nav-item">
                <router-link class="nav-link" to="/admin-dashboard">Dashboard</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/admin-summary">Summary</router-link>
              </li>
            </template>


            <li class="nav-item" v-if="state.loggedIn">
              <a class="nav-link logout-link" @click="logout">Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,

  methods: {
    logout() {
      sessionStorage.clear();
      this.$store.commit("logout");
      this.$store.commit("setRole", null);
      this.$router.push("/");

      this.closeNavbar();
    },

    closeNavbar() {
      const navbarCollapse = document.getElementById("navbarNav");
      if (navbarCollapse.classList.contains("show")) {
        navbarCollapse.classList.remove("show");
      }
    }
  },

  computed: {
    state() {
      return this.$store.state;
    },
  },

  mounted() {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        this.closeNavbar();
      });
    });
  }
};

export default Navbar;