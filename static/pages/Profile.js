const Profile = {
  template: `
    <div class="profile-container">
      <h2>Student Profile</h2>
      <div class="profile-box">
        <p><strong>Name:</strong> {{ fullName }}</p>
        <p><strong>Email:</strong> {{ email }}</p>
        <p><strong>Role:</strong> {{ role }}</p>
        <p><strong>Qualification:</strong> {{ qualification }}</p>
        <p><strong>Date of Birth:</strong> {{ dob }}</p>
      </div>
    </div>
  `,
  data() {
    return {
      email: sessionStorage.getItem('email') || 'Not Available',
      role: sessionStorage.getItem('role') || 'Student',
      fullName: sessionStorage.getItem('full_name') || 'Unknown',
      qualification: sessionStorage.getItem('qualification') || 'Not Provided',
      dob: sessionStorage.getItem('dob') || 'Not Available',
    };
  }
};

export default Profile;