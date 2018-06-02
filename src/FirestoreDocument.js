import { Component } from 'react';
import PropTypes from 'prop-types';

class FirestoreDocument extends Component {
  static propTypes = {
    path: PropTypes.string.isRequired,
    children: PropTypes.func,
    render: PropTypes.func,
  };

  static contextTypes = {
    firestoreDatabase: PropTypes.object.isRequired,
    firestoreCache: PropTypes.object.isRequired,
  };

  state = {
    error: null,
    isLoading: true,
    data: null,
    snapshot: null,
  };

  componentDidMount() {
    this.setupFirestoreListener(this.props);
  }

  componentWillUnmount() {
    this.handleUnsubscribe();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.path !== this.props.path) {
      this.handleUnsubscribe();

      this.setState({ isLoading: true, error: null }, () =>
        this.setupFirestoreListener(this.props),
      );
    }
  }

  handleUnsubscribe() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  setupFirestoreListener = props => {
    const { firestoreDatabase } = this.context;
    const { path } = props;
    const documentRef = firestoreDatabase.doc(path);

    this.unsubscribe = documentRef.onSnapshot(
      this.handleFirestoreSnapshot,
      this.handleFirestoreError,
    );
  };

  handleFirestoreSnapshot = snapshot => {
    if (snapshot.exists) {
      this.setState({
        error: null,
        isLoading: false,
        data: {
          id: snapshot.id,
          ...snapshot.data(),
        },
        snapshot,
      });
    } else {
      this.handleFirestoreError(
        new Error(`Document does not exist at ${snapshot.ref.path}`)
      );
    }
  };

  handleFirestoreError = error => {
    this.setState({
      error,
      isLoading: false,
      data: null,
      snapshot: null,
    });
  };

  render() {
    const { children, render } = this.props;

    if (render) return render(this.state);

    if (typeof children === 'function') return children(this.state);

    return null;
  }
}

export default FirestoreDocument;
