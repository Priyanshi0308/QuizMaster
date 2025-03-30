const SubjectResource = {
  template: `
    <div>
      <!-- Add Subject Button -->
      <button class="btn btn-success mb-3" @click="openSubjectPopup">Add Subject</button>

      <!-- Subject List -->
      <div class="card shadow-sm p-4 mb-4 subject-card" v-for="subject in subjects" :key="subject.id">
        <div class="card-body">
          <h3 class="card-title text-center mb-3 text-primary text-truncate">{{ subject.name }}</h3>
          <p class="card-text text-secondary text-truncate">{{ subject.description }}</p>
        </div>
        <div class="card-footer text-muted text-end">
          <small>Chapters: {{ subject.chapters.length }}</small>
          <button class="btn btn-primary mt-2" @click="openChapterPopup(subject)">Add Chapter</button>
          <button class="btn btn-info mt-2" @click="toggleChapters(subject)">
            {{ showChapters && currentSubject?.id === subject.id ? 'Hide' : 'Show' }} Chapters
          </button>
          <button class="btn btn-danger mt-2" @click="deleteSubject(subject.id)">Delete Subject</button>
        </div>
      </div>

      <!-- Add Subject Popup -->
      <div v-if="showSubjectPopup" class="popup-overlay d-flex align-items-center justify-content-center">
        <div class="popup-content card shadow p-4">
          <h3 class="card-title text-center mb-3 text-primary">Add Subject</h3>
          <form @submit.prevent="saveSubject">
            <div class="mb-3">
              <label for="subjectName" class="form-label">Subject Name</label>
              <input type="text" v-model="subjectForm.name" class="form-control" required />
            </div>
            <div class="mb-3">
              <label for="subjectDescription" class="form-label">Description</label>
              <textarea v-model="subjectForm.description" class="form-control"></textarea>
            </div>
            <button type="submit" class="btn btn-success">Add Subject</button>
            <button type="button" class="btn btn-secondary mt-3" @click="closeSubjectPopup">Cancel</button>
          </form>
        </div>
      </div>

      <!-- Add/Edit Chapter Popup -->
      <div v-if="showChapterPopup" class="popup-overlay d-flex align-items-center justify-content-center">
        <div class="popup-content card shadow p-4">
          <h3 class="card-title text-center mb-3 text-primary">{{ isEditingChapter ? 'Edit' : 'Add' }} Chapter</h3>
          <form @submit.prevent="isEditingChapter ? updateChapter() : saveChapter()">
            <div class="mb-3">
              <label class="form-label">Chapter Name</label>
              <input type="text" v-model="chapterForm.name" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea v-model="chapterForm.description" class="form-control"></textarea>
            </div>
            <button type="submit" class="btn btn-success">{{ isEditingChapter ? 'Update' : 'Add' }} Chapter</button>
            <button type="button" class="btn btn-secondary mt-3" @click="closeChapterPopup">Cancel</button>
          </form>
        </div>
      </div>

      <!-- Display Chapters -->
      <div v-if="showChapters && currentSubject" class="mt-4">
        <h4 class="text-primary">Chapters for {{ currentSubject.name }}</h4>
        <ul class="list-group mt-2">
          <li class="list-group-item d-flex justify-content-between align-items-center" v-for="chapter in currentSubject.chapters" :key="chapter.id">
            <div>
              <strong class="text-dark">{{ chapter.name }}</strong>: {{ chapter.description }}
            </div>
            <div>
              <button class="btn btn-warning btn-sm me-2" @click="editChapter(chapter)">Edit</button>
              <button class="btn btn-danger btn-sm" @click="deleteChapter(chapter.id)">Delete</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `,
  data() {
    return {
      subjects: [],
      showChapters: false,
      showChapterPopup: false,
      showSubjectPopup: false,
      currentSubject: null,
      isEditingChapter: false,
      chapterForm: {
        name: '',
        description: '',
        id: null
      },
      subjectForm: {
        name: '',
        description: ''
      }
    };
  },
  methods: {
    async fetchSubjects() {
      try {
        const response = await fetch('/api/subjects', {
          headers: { 'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem("token")
           },
        });
        this.subjects = await response.json();
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    },
    openSubjectPopup() {
      this.subjectForm = { name: '', description: '' };
      this.showSubjectPopup = true;
    },
    closeSubjectPopup() {
      this.showSubjectPopup = false;
    },
    async saveSubject() {
      try {
        await fetch('http://127.0.0.1:5000/api/subjects', {
          method: 'POST',
          body: JSON.stringify(this.subjectForm),
          headers: { 'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem("token") }
        });
        this.fetchSubjects();
        this.closeSubjectPopup();
      } catch (error) {
        console.error('Error adding subject:', error);
      }
    },
    async deleteSubject(subjectId) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/subjects/${subjectId}`, {
          method: 'DELETE',
          headers: {
            "Authentication-Token": sessionStorage.getItem("token"), // Ensure token is passed
            "Content-Type": "application/json"
          }
        });
    
        const data = await response.json();
        console.log("Delete Response:", data); // Log response
    
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${data.error}`);
        }
    
        this.fetchSubjects(); // Refresh subjects after deletion
      } catch (error) {
        console.error('Error deleting subject:', error);
      }
    },
    openChapterPopup(subject) {
      this.currentSubject = subject;
      this.chapterForm = { name: '', description: '', id: null };
      this.isEditingChapter = false;
      this.showChapterPopup = true;
    },
    editChapter(chapter) {
      this.chapterForm = { ...chapter };
      this.isEditingChapter = true;
      this.showChapterPopup = true;
    },
    async saveChapter() {
      if (!this.currentSubject) return;
      try {
        await fetch(`http://127.0.0.1:5000/api/subjects/${this.currentSubject.id}/chapters`, {
          method: 'POST',
          body: JSON.stringify(this.chapterForm),
          headers: { 'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem("token") }
        });
        this.fetchSubjects();
        this.closeChapterPopup();
      } catch (error) {
        console.error('Error adding chapter:', error);
      }
    },
    async updateChapter() {
      if (!this.currentSubject || !this.chapterForm.id) return;
      try {
        await fetch(`http://127.0.0.1:5000/api/chapters/${this.chapterForm.id}`, {
          method: 'PUT',
          body: JSON.stringify(this.chapterForm),
          headers: { 'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem("token") }
        });
        this.fetchSubjects();
        this.closeChapterPopup();
      } catch (error) {
        console.error('Error updating chapter:', error);
      }
    },
    async deleteChapter(chapterId) {
      try {
        await fetch(`http://127.0.0.1:5000/api/chapters/${chapterId}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': sessionStorage.getItem("token"),
            'Content-Type': 'application/json'
          }
        });
        this.fetchSubjects();
      } catch (error) {
        console.error('Error deleting chapter:', error);
      }
    },
    closeChapterPopup() {
      this.showChapterPopup = false;
    },
    async toggleChapters(subject) {
      if (this.currentSubject?.id === subject.id) {
        this.showChapters = !this.showChapters;
      } else {
        try {
          const response = await fetch(`http://127.0.0.1:5000/api/subjects/${subject.id}`, {
            headers: { 'Content-Type': 'application/json',
              'Authentication-Token': sessionStorage.getItem("token")
             },
          })
          this.currentSubject = await response.json();
          this.showChapters = true;
        } catch (error) {
          console.error('Error fetching chapters:', error);
        }
      }
    }
  },
  mounted() {
    this.fetchSubjects();
  }
};

export default SubjectResource;
