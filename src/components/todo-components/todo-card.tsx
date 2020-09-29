import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  MouseEvent,
} from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import {
  ClickAwayListener,
  Card,
  CardContent,
  CardActions,
  CardActionArea,
  Button,
  TextField,
  Typography,
  Tooltip,
  Divider,
} from '@material-ui/core';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import moment from 'moment';

// Types
import { ITodo, ITodoValidations, ICustomValidator } from '@/types';

// Utils
import { todoAPI, CustomValidator } from '@/utils';

// Redux Actions
import { addTodo, updateTodo, deleteTodo } from '@/redux/actions/todo-actions';

// Components
import TodoDatePicker from './todo-date-picker';
import TodoTimeForm from './todo-time-form';
import { Duplex } from 'stream';

export interface ITodoCardProps {
  todo?: ITodo;
  mode?: 'add' | 'update' | 'show';
  onCancel?: () => void;
  onComplete?: () => void;
}

export default function TodoCard({
  todo = {} as ITodo,
  mode = 'add',
  onCancel,
  onComplete = () => {},
}: ITodoCardProps) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [modeState, setModeState] = useState<'add' | 'update' | 'show'>(mode);
  const [todoData, setTodoData] = useState<ITodo>({
    name: '',
    due: moment(),
    isTimeSet: false,
    dueDate: '',
    dueTime: '',
    priority: 0,
    position: null,
    completed: false,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [todoErrors, setTodoErrors] = useState<ITodoValidations>({
    name: null,
    dueTime: null,
  });

  useEffect(() => {
    switch (modeState) {
      case 'add':
        break;

      case 'update':
        setTodoData({
          ...todo,
          due: moment(todo.due),
        });

      default:
        setTodoData({
          ...todo,
          due: moment(todo.due),
        });
        break;
    }
  }, [modeState]);

  const clearTodoData = (): void => {
    setTodoData({
      name: '',
      due: moment(),
      isTimeSet: false,
      dueDate: '',
      dueTime: '',
      priority: 0,
      position: null,
      completed: false,
    });
  };

  const checkTodoErrors = (): boolean => {
    const { name, dueTime } = todoData;
    const checkedTodoErrors: ITodoValidations = {
      name: CustomValidator.todoName(name),
      dueTime: CustomValidator.dueTime(dueTime),
    };

    setTodoErrors({
      ...todoErrors,
      ...checkedTodoErrors,
    });

    if (
      Object.values(checkedTodoErrors).every(
        (checkedTodoError) => checkedTodoError === null,
      )
    ) {
      return true;
    }

    return false;
  };

  const handleOnChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    if (e.target.name === 'name') {
      setTodoErrors({
        ...todoErrors,
        [e.target.name]: CustomValidator.todoName(e.target.value),
      });
    } else {
      setTodoErrors({
        ...todoErrors,
        [e.target.name]: (CustomValidator as ICustomValidator)[e.target.name](
          e.target.value,
        ),
      });
    }

    setTodoData({
      ...todoData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddTodo = async (
    e:
      | FormEvent<HTMLFormElement | HTMLInputElement | HTMLTextAreaElement>
      | MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      if (checkTodoErrors()) {
        const { name, due, isTimeSet, priority } = todoData;
        const { data } = await todoAPI.post('/', {
          name,
          due,
          isTimeSet,
          priority,
        });

        setLoading(false);
        dispatch(addTodo(data.todo));
        clearTodoData();
        onComplete();
      } else {
        setLoading(false);
        // handle here
      }
    } catch (err) {
      setLoading(false);

      if (err.response) {
        console.log(err.response.data.message);
      }
    }
  };

  const handleUpdateTodo = async (
    e:
      | FormEvent<HTMLFormElement | HTMLInputElement | HTMLTextAreaElement>
      | MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      if (checkTodoErrors()) {
        const { name, due, isTimeSet, priority } = todoData;
        const { data } = await todoAPI.put(`/${todo._id}`, {
          name,
          due,
          isTimeSet,
          priority,
        });

        setLoading(false);

        dispatch(updateTodo(data.todo));
        clearTodoData();
        setModeState('show');
        onComplete();
      } else {
        setLoading(false);
        // handle here
      }
    } catch (err) {
      setLoading(false);

      if (err.response) {
        console.log(err.response.data.message);
      }
    }
  };

  const handleChangeModeToUpdate = (): void => {
    setModeState('update');
  };

  const handleCancelLocal = (): void => {
    setModeState('show');
  };

  const handleChangeDueDate = (date: MaterialUiPickersDate): void => {
    setTodoData({
      ...todoData,
      due: date,
    });
  };

  const handleChangeDueTime = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setTodoErrors({
      ...todoErrors,
      dueTime: CustomValidator.dueTime(e.target.value),
    });

    setTodoData({
      ...todoData,
      dueTime: e.target.value,
    });
  };

  const clearDueTimeForm = (): void => {
    setTodoData({
      ...todoData,
      dueTime: '',
    });
  };

  const handleSetDueTime = (): void => {
    let { due, dueTime } = todoData;

    if (dueTime === null || dueTime.length <= 0) {
      setTodoData({
        ...todoData,
        isTimeSet: false,
        dueTime: '',
      });

      return;
    }

    const time = moment(dueTime, 'hh A');

    due = moment(due);

    if (due.get('hour') > time.get('hour')) {
      due = due.add(1, 'day');
    }

    due = due.set({
      hour: time.get('hour'),
      minute: time.get('minute'),
    });

    setTodoData({
      ...todoData,
      due,
      isTimeSet: true,
      dueTime: time.format('hh:mm A'),
    });
  };

  const handleChangeMode = (mode: 'add' | 'update' | 'show'): void => {
    setModeState(mode);
  };

  const handleTodoTimeStatus = (status: 'set' | 'unset'): void => {
    switch (status) {
      case 'set':
        setTodoData({
          ...todoData,
          isTimeSet: true,
        });
        break;

      case 'unset':
        setTodoData({
          ...todoData,
          isTimeSet: false,
          dueTime: '',
        });
        break;

      default:
        break;
    }
  };

  return (
    <ClickAwayListener onClickAway={onCancel || handleCancelLocal}>
      <Card classes={{ root: classes.todoCard }}>
        <CardContent classes={{ root: classes.todoCardContent }}>
          {modeState === 'add' ? (
            <form onSubmit={handleAddTodo}>
              <TextField
                autoFocus
                placeholder={`e.g. Buy some carrots`}
                name={`name`}
                required
                value={todoData.name}
                onChange={handleOnChange}
                // multiline
                error={todoErrors.name !== null && todoErrors.name.length > 0}
                helperText={todoErrors.name}
                disabled={loading}
              />
            </form>
          ) : modeState === 'update' ? (
            <form onSubmit={handleUpdateTodo}>
              <TextField
                autoFocus
                placeholder={`e.g. Buy some carrots`}
                name={`name`}
                required
                value={todoData.name}
                onChange={handleOnChange}
                // multiline
                error={todoErrors.name !== null && todoErrors.name.length > 0}
                helperText={todoErrors.name}
                disabled={loading}
              />
            </form>
          ) : (
            <CardActionArea
              classes={{ root: classes.showTodoNameWrapper }}
              onClick={handleChangeModeToUpdate}
            >
              <Typography
                classes={{ root: classes.todoName }}
                variant={`h5`}
                align={`justify`}
              >
                {todoData.name}
              </Typography>

              <Divider />
            </CardActionArea>
          )}

          <TodoDatePicker todo={todoData} onChange={handleChangeDueDate} />

          <TodoTimeForm
            todo={todoData}
            todoErrors={todoErrors}
            onChange={handleChangeDueTime}
            onComplete={handleSetDueTime}
            clearForm={clearDueTimeForm}
            mode={modeState}
            modeHandler={handleChangeMode}
            statusHandler={handleTodoTimeStatus}
          />
        </CardContent>
        {modeState === 'add' ? (
          <CardActions classes={{ root: classes.todoCardActions }}>
            <Tooltip arrow title={`Cancel Add Todo`}>
              <Button
                color={`secondary`}
                onClick={onCancel}
                size={`small`}
                disabled={loading}
              >
                Cancel
              </Button>
            </Tooltip>

            <Tooltip arrow title={`Add Todo`}>
              <Button
                variant={`contained`}
                color={`primary`}
                onClick={handleAddTodo}
                size={`small`}
                disabled={loading}
              >
                Add
              </Button>
            </Tooltip>
          </CardActions>
        ) : modeState === 'update' ? (
          <CardActions classes={{ root: classes.todoCardActions }}>
            <Tooltip arrow title={`Cancel Update Todo`}>
              <Button
                color={`secondary`}
                onClick={onCancel || handleCancelLocal}
                size={`small`}
                disabled={loading}
              >
                Cancel
              </Button>
            </Tooltip>

            <Tooltip arrow title={`Update Todo`}>
              <Button
                variant={`contained`}
                color={`primary`}
                onClick={handleUpdateTodo}
                size={`small`}
                disabled={loading}
              >
                Update
              </Button>
            </Tooltip>
          </CardActions>
        ) : (
          <CardActions
            classes={{ root: classes.todoCardActions }}
          ></CardActions>
        )}
      </Card>
    </ClickAwayListener>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    todoCard: {
      width: 250,
      height: 250,
      padding: theme.spacing(1),
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    todoCardContent: {
      width: '100%',
      height: '65%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'stretch',
    },
    todoCardActions: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing(2),
    },
    showTodoNameWrapper: {
      width: '100%',
      cursor: 'text',
    },
    todoName: {},
  }),
);
