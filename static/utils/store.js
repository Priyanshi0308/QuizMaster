// data that should be globally available to all components

const store = new Vuex.Store({
    //data properties
    state : {
        loggedIn: false,
        role: "",
    },


// we can change the state by using mutations
    mutations : {
        setLogin(state){
            state.loggedIn = true
        },
        logout(state){
            state.loggedIn = false;
            state.role = "";  // Reset role when logging out
            localStorage.removeItem("loggedIn");
            localStorage.removeItem("role");
        },
        setRole(state, role){
            state.role = role;
        },
    },
})

export default store

 