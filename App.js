import React, {useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';

import * as SQLITE from 'expo-sqlite';
import { useEffect } from 'react';

export default function App() {

  const db = SQLITE.openDatabase('example.db');
  const [isLoading, setIsLoading] = useState(true);
  const [names, setNames] = useState([]);
  const [currentName, setCurrentName] = useState(undefined);

  useEffect(() => {

    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS names (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);');
    });
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM names;', null, 
      (txObj, resultSet) => setNames(resultSet.rows._array),
      (txObj, error) => console.log(error));
    });

    setIsLoading(false);

  }, []);


  if(isLoading){
    return <View style={styles.container}><Text>Loading names...</Text></View>
  }

  const showNames = () => {

    return names.map((name, index) => {

      return (
        <View style={styles.row} key={index}>
          <Text>{name.name}</Text>
          <Button title='Delete' onPress={() => deleteName(name.id)}/>
          <Button title='Update' onPress={() => updateName(name.id)}/>
        </View>
      )

    })

  }

  const addName = () => {

    db.transaction(tx => {

      tx.executeSql('INSERT INTO names (name) VALUES (?);', [currentName],
        (txObj, resultSet) => {
          let existingNames = [...names];
          existingNames.push({id: resultSet.insertId, name: currentName});
          setNames(existingNames);
          setCurrentName(undefined);
        },
        (txObj, error) => console.log(error.message)
      );

    })

  }

  const updateName = (id) => {

    db.transaction(tx => {

      tx.executeSql('UPDATE names SET name = ? WHERE id = ?;', [currentName, id],
        (txObj, resultSet) => {
          if(resultSet.rowsAffected > 0){
            let existingNames = [...names];
            const indexToUpdate = existingNames.findIndex(name => name.id === id);
            existingNames[indexToUpdate].name = currentName;
            setNames(existingNames);
            setCurrentName(undefined);
          }
        },
        (txObj, error) => console.log(error)
      );
      
    })

  }

  const deleteName = (id) => {

    db.transaction(tx => {
      tx.executeSql('DELETE FROM names WHERE id = ?;', [id],
        (txObj, resultSet) => {
          if(resultSet.rowsAffected > 0){
            let existingNames = [...names].filter(name => name.id !== id);
            setNames(existingNames);
          }
        },
        (txObj, error) => console.log(error.message)
      );
    })

  }

  return (
    <View style={styles.container}>

      <TextInput value={currentName} placeholder='Name' onChangeText={setCurrentName}/>

      <Button title='Add name' onPress={addName}/>

      {showNames()}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    margin: 8,
  }
});
