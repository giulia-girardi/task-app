# Taskit

## Description

Taskit is an app to manage your to-do list. You can add a task, set a due date for it, edit it or delete it. You can also share the task with other Task it users. 
 
## User Stories

- **404** - As a user I want to see a nice 404 page when I go to a page that doesn’t exist so that I know it was my fault 
- **500** - As a user I want to see a nice error page when the super team screws it up so that I know that is not my fault
- **homepage** - As a user I want to be able to access the homepage so that I see what the app is about and login and signup
- **sign up** - As a user I want to sign up on the webpage so that I can manage my to-dos
- **login** - As a user I want to be able to log in on the webpage so that I can get back to my account
- **logout** - As a user I want to be able to log out from the webpage
- **dashboard** - As a user I want to have a clear overview of the tasks due today
- **tasks list** - As a user I want to see the complete list of tasks to be done, both the ones I created and the ones other users shared with me
- **past tasks** - As a user I want to see all the tasks I completed in the pasts
- **create task** - As a user I want to create a new task
- **edit task** - As a user I want to edit details of the tasks

## Backlog

List of other features outside of the MVPs scope

User profile:
- see my name on the navbar 
- upload my profile picture
- be able to signup with Google

Tasks: 
- delete collaborators when editing a task
- see how many days are left to complete a task
- search, filter and sort tasks
- uncheck done tasks
- add collaborators with autocomplete
- see collaborators only if there are, and not see myself as a collaborator
- prevent users to write twice the same email of collaborators


## ROUTES:

- GET / 
  - renders the homepage
- GET /signup
  - redirects to /dashboard if user logged in
  - renders the signup form
- POST /signup
  - redirects to /dashboard if user logged in
  - form:
    - first name
    - last name
    - email
    - password
- GET /login
  - redirects to /dashboard if user logged in
  - renders the login form 
- POST /login
  - redirects to /dashboard if user logged in
  - form:
    - email
    - password
- POST /logout
  - redirects to /login

- GET /dashboard
  - renders the tasks due today (own and shared)
- POST /dashboard
  - redirects to /dashboard when task is marked as completed
- GET /past-tasks
  - renders past tasks (own and shared)

- GET /tasks
  - renders the list of all tasks to be completed (own and shared)
- POST /tasks
  - 


<!-- 
- POST /events/create 
  - redirects to / if user is anonymous
  - body: 
    - name
    - date
    - location
    - description
- GET /events/:id
  - renders the event detail page
  - includes the list of attendees
  - attend button if user not attending yet
- POST /events/:id/attend 
  - redirects to / if user is anonymous
  - body: (empty - the user is already stored in the session) -->


## Models

User model
 
```
firstName: String
lastName: String
email: String
password: String
tasks: [ObjectId<Tasks>]
sharedTasks: [ObjectId<Tasks>]
```

Task model

```
taskName: String
dueDate: String
collaborators: [String]
taskCompleted: Boolean
taskOwner: ObjectId<User>
``` 

## Links

### Git

[Repository Link](https://github.com/giulia-girardi/task-app)

[Deploy Link](https://taskit.cyclic.app/)

### Slides

The url to your presentation slides

[Slides Link](http://slides.com)
