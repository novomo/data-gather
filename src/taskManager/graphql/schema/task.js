const task = `
    type Task {
        task: String!
    }

    type Query {
        startTask(task: String!): Boolean!
    }

    type Subscription {
        sendTask: Task!
    }
`;

module.exports = task;
