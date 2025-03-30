import ChartComponent from '../components/ChartComponent.js';

const AdminSummary = {
    template: `
        <div>
            <h1>Admin Summary</h1>

            <button @click="showUsers = true">Total Users: {{ totalUsers }}</button>
            <button @click="showSubjects = true">Total Subjects: {{ totalSubjects }}</button>
            <button @click="showChapters = true">Total Chapters: {{ totalChapters }}</button>

            <ChartComponent 
                v-if="subjectData.length"
                chartId="quizSubjectChart" 
                chartLabel="Quizzes per Subject" 
                :chartData="subjectData" 
                :chartLabels="subjectLabels"
            />

            <ChartComponent 
                v-if="chapterData.length"
                chartId="quizChapterChart" 
                chartLabel="Quizzes per Chapter" 
                :chartData="chapterData" 
                :chartLabels="chapterLabels"
            />

            <!-- Users Modal -->
            <div v-if="showUsers" class="modal">
                <div class="modal-content">
                    <span class="close" @click="showUsers = false">&times;</span>
                    <h2>User Details</h2>
                    <table>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Full Name</th>
                            <th>DOB</th>
                            <th>Qualification</th>
                        </tr>
                        <tr v-for="user in users" :key="user.id">
                            <td>{{ user.id }}</td>
                            <td>{{ user.email }}</td>
                            <td>{{ user.full_name }}</td>
                            <td>{{ user.dob }}</td>
                            <td>{{ user.qualification }}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Subjects Modal -->
            <div v-if="showSubjects" class="modal">
                <div class="modal-content">
                    <span class="close" @click="showSubjects = false">&times;</span>
                    <h2>Subject Details</h2>
                    <table>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                        </tr>
                        <tr v-for="subject in subjects" :key="subject.id">
                            <td>{{ subject.id }}</td>
                            <td>{{ subject.name }}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Chapters Modal -->
            <div v-if="showChapters" class="modal">
                <div class="modal-content">
                    <span class="close" @click="showChapters = false">&times;</span>
                    <h2>Chapter Details</h2>
                    <table>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Subject ID</th>
                        </tr>
                        <tr v-for="chapter in Object.values(chapters)" :key="chapter.id">
                            <td>{{ chapter.id }}</td>
                            <td>{{ chapter.name }}</td>
                            <td>{{ chapter.subject_id }}</td>
                        </tr>
                    </table>
                </div>
            </div>

        </div>
    `,
    components: { ChartComponent },
    data() {
        return {
            totalUsers: 0,
            totalSubjects: 0,
            totalChapters: 0,
            users: [],
            subjects: [],
            chapters: {},
            subjectLabels: [],
            subjectData: [],
            chapterLabels: [],
            chapterData: [],
            showUsers: false,
            showSubjects: false,
            showChapters: false
        }
    },
    async mounted() {
        try {
            const response = await fetch('/api/admin-summary');
            const data = await response.json();

            this.users = data.users;
            this.subjects = data.subjects;
            this.chapters = data.chapters;
            this.totalUsers = data.users.length;
            this.totalSubjects = data.subjects.length;
            this.totalChapters = Object.keys(data.chapters).length;

            // Fix: Count quizzes per subject directly from Quiz table
            const quizzesPerSubject = {};
            this.subjects.forEach(subject => quizzesPerSubject[subject.id] = 0);
            data.quizzes.forEach(quiz => {
                const chapter = this.chapters[quiz.chapter_id];
                if (chapter && quizzesPerSubject[chapter.subject_id] !== undefined) {
                    quizzesPerSubject[chapter.subject_id]++;
                }
            });

            this.subjectLabels = this.subjects.map(subject => subject.name);
            this.subjectData = this.subjectLabels.map((_, index) => quizzesPerSubject[this.subjects[index].id]);

            // Fix: Count quizzes per chapter directly from Quiz table
            const quizzesPerChapter = {};
            Object.values(this.chapters).forEach(chapter => quizzesPerChapter[chapter.id] = 0);
            data.quizzes.forEach(quiz => {
                if (quizzesPerChapter[quiz.chapter_id] !== undefined) {
                    quizzesPerChapter[quiz.chapter_id]++;
                }
            });

            this.chapterLabels = Object.values(this.chapters).map(chapter => chapter.name);
            this.chapterData = this.chapterLabels.map((_, index) => quizzesPerChapter[Object.values(this.chapters)[index].id]);

        } catch (error) {
            console.error('Error fetching admin summary:', error);
        }
    }
}

export default AdminSummary;