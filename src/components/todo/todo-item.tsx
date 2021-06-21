import React, { FC } from 'react';
import { Grid, Typography, Divider } from '@material-ui/core';

// Types
import { Todo } from '@/types/todo';

type TodoItemProps = {
  todo: Todo;
};

const TodoItem: FC<TodoItemProps> = ({ todo }) => {
  return (
    <Grid container direction={`column`}>
      <Grid item container>
        <Grid item>
          <Typography>{todo.name}</Typography>
        </Grid>
      </Grid>

      <Grid item>
        <Divider orientation={`horizontal`} flexItem />
      </Grid>
    </Grid>
  );
};

export default TodoItem;
