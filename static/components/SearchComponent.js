const SearchComponent = {
    template: `
      <div class="mb-4">
        <input 
          type="text" 
          v-model="searchQuery" 
          class="form-control" 
          placeholder="Search for subjects..." 
          @input="filterSubjects"
        />
        <ul v-if="searchResults.length" class="list-group mt-2">
          <li 
            v-for="subject in searchResults" 
            :key="subject.id" 
            class="list-group-item d-flex justify-content-between align-items-center"
            @click="selectSubject(subject)"
          >
            {{ subject.name }}
            <span class="badge bg-primary rounded-pill">{{ subject.chapters.length }} Chapters</span>
          </li>
        </ul>
        <p v-else-if="searchQuery" class="text-muted mt-2">No results found.</p>
      </div>
    `,
    props: {
      subjects: Array // Receives the full subject list from the parent component
    },
    data() {
      return {
        searchQuery: "",
        searchResults: []
      };
    },
    methods: {
      filterSubjects() {
        if (!this.searchQuery.trim()) {
          this.searchResults = []; // Clear results if input is empty
          return;
        }
        this.searchResults = this.subjects.filter(subject =>
          subject.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      },
      selectSubject(subject) {
        this.$emit("subject-selected", subject); // Emit event to parent
      }
    }
  };
  
  export default SearchComponent;