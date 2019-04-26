import React from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      e1rm: "",
      weight: "",
      reps: "",
      rpe: "",
      wantWeight: ""
    }
  }

  // This is a translation of Tuchscherer's standard percentage chart into
  // a continuous function. This enables using real numbers for RPEs, like 8.75.
  percentage = (reps, rpe) => {
    // Cap the RPE at 10.
    if (rpe > 10) {
      rpe = 10.0;
    }

    // No prediction if failure occurred, or if RPE is unreasonably low.
    if (reps < 1 || rpe < 4) {
      return 0.0;
    }

    // Handle the obvious case early to avoid bound errors.
    if (reps === 1 && rpe === 10.0) {
      return 100.0;
    }

    // x is defined such that 1@10 = 0, 1@9 = 1, 1@8 = 2, etc.
    // By definition of RPE, then also:
    //  2@10 = 1@9 = 1
    //  3@10 = 2@9 = 1@8 = 2
    // And so on. That pattern gives the equation below.
    var x = (10.0 - rpe) + (reps - 1);

    // The logic breaks down for super-high numbers,
    // and it's too hard to extrapolate an E1RM from super-high-rep sets anyway.
    if (x >= 16) {
      return 0.0;
    }

    var intersection = 2.92;

    // The highest values follow a quadratic.
    // Parameters were resolved via GNUPlot and match extremely closely.
    if (x <= intersection) {
      var a = 0.347619;
      var b = -4.60714;
      var c = 99.9667;
      return a * x * x + b * x + c;
    }

    // Otherwise it's just a line, since Tuchscherer just guessed.
    var m = -2.64249;
    var b = 97.0955;
    return m * x + b;
  }

  calc = () => {
    const have_weight = this.state.weight
    const have_reps = this.state.reps
    const have_rpe = this.state.rpe
    const want_reps = this.state.wantReps
    const want_rpe = this.state.wantRpe

    // Ensure that the E1RM widgets are sane.
    // if (isNaN(have_weight) || have_weight <= 0) return;
    // if (isNaN(have_reps) || have_reps <= 0) return;
    // if (Math.floor(have_reps) !== have_reps) return;
    // if (isNaN(have_rpe) || have_rpe <= 0) return;

    // Calculate the E1RM percentage.
    let p = this.percentage(have_reps, have_rpe);
    if (p <= 0) return;
    let e1rm = have_weight / p * 100;
    if (e1rm <= 0) return;
    e1rm = e1rm.toFixed(1)

    // Write the E1RM.
    this.setState({e1rm: e1rm})

    // Ensure that the Weight widgets are sane.
    // if (isNaN(want_reps) || want_reps <= 0) return;
    // if (Math.floor(want_reps) !== want_reps) return;
    // if (isNaN(want_rpe) || want_rpe <= 0) return;

    // Calculate the Weight percentage.
    const p2 = this.percentage(want_reps, want_rpe);
    if (p2 <= 0) return;
    const weight = (e1rm / 100 * p2).toFixed(1)

    // Write the Weight
    this.setState({wantWeight: weight})
  }

  render () {
    return (
      <View style={styles.container}>
        <Text style={styles.textStyle}>HAVE</Text>
        <TextInput
          style={styles.textInputStyle}
          placeholder="Weight"
          onChangeText={(weight) => this.setState({weight})}/>
        <TextInput
          style={styles.textInputStyle}
          placeholder="Reps"
          onChangeText={(reps) => this.setState({reps})}/>
        <TextInput
          style={styles.textInputStyle}
          placeholder="RPE"
          onChangeText={(rpe) => this.setState({rpe})}/>
        <Text style={styles.textStyle}>E1RM: {this.state.e1rm}</Text>
        <Text style={styles.textStyle}>WANT</Text>
        <TextInput
          style={styles.textInputStyle}
          placeholder="Reps"
          onChangeText={(wantReps) => this.setState({wantReps})}/>
        <TextInput
          style={styles.textInputStyle}
          placeholder="RPE"
          onChangeText={(wantRpe) => this.setState({wantRpe})}/>
        <Text style={styles.textStyle}>Weight: {this.state.wantWeight}</Text>
        <Button title="Calculate" onPress={this.calc}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9a74ac',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    color: '#fff',
    fontSize: 20
  },
  textInputStyle: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20
  }
});
