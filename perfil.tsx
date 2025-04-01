import type { DatePickerFilter } from '@ant-design/react-native'
import { DatePickerView } from '@ant-design/react-native'
import React, { useState } from 'react'
import { ScrollView, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'; // Importar el hook de navegación
import { createStackNavigator } from '@react-navigation/stack';  
import { NavigationContainer } from '@react-navigation/native'; 

const ahora = new Date()

export default function Perfil() {
    const navigation = useNavigation(); // Inicializar la navegación
    const [modalVisible, setModalVisible] = useState(false);
  
    React.useLayoutEffect(() => {
      navigation.setOptions({
        headerBackTitleVisible: false,
        headerTintColor: '#40632F', 
      });
    }, [navigation]);
  
    const toggleModal = () => {
      setModalVisible(!modalVisible);
    };
    const [valor, setValor] = useState(ahora);
  
    return (
        <ScrollView nestedScrollEnabled>
        <Text style={{ margin: 16 }}>Uso Básico</Text>
        <DatePickerView defaultValue={ahora} />
  
        <Text style={{ margin: 16 }}>Modo Controlado</Text>
        <DatePickerView
          value={valor}
          onChange={(val: Date) => {
            setValor(val)
            console.log('onChange', val)
          }}
        />
  
        <Text style={{ margin: 16 }}>Renderizado Personalizado de Cada Columna</Text>
        <DatePickerView defaultValue={ahora} renderLabel={etiquetaRenderer} />
  
        <Text style={{ margin: 16 }}>Selector de Semana</Text>
        <DatePickerView
          onChange={(val: Date) => console.log('onChange', val)}
          precision="week-day"
          defaultValue={ahora}
          renderLabel={etiquetaSemanaRenderer}
        />
  
        <Text style={{ margin: 16 }}>Filtrar Horas Disponibles</Text>
        <DatePickerView
          defaultValue={ahora}
          precision="hour"
          renderLabel={etiquetaRenderer}
          filter={filtroFecha}
        />
      </ScrollView>
    );
  }
  

const etiquetaRenderer = (tipo: string, dato: number) => {
  switch (tipo) {
    case 'year':
      return dato + ' año'
    case 'month':
      return dato + ' mes'
    case 'day':
      return dato + ' día'
    case 'hour':
      return dato + ' hora'
    case 'minute':
      return dato + ' min'
    case 'second':
      return dato + ' seg'
    default:
      return dato
  }
}

const etiquetaSemanaRenderer = (tipo: string, dato: number) => {
  switch (tipo) {
    case 'year':
      return dato + ' año'
    case 'week':
      return dato + ' semana'
    case 'week-day':
      return diaSemanaToEs(dato)
    default:
      return dato
  }
}

const filtroFecha: DatePickerFilter = {
  day: (_val, { date }) => {
    // Excluir todos los fines de semana
    if (date.getDay() > 5 || date.getDay() === 0) {
      return false
    }
    return true
  },
  hour: (val: number) => {
    // Solo permitir horas de 14 a 18
    if (val < 14 || val > 18) {
      return false
    }
    return true
  },
}

const diaSemanaToEs = (diaSemana: number) => {
  switch (diaSemana) {
    case 1:
      return 'Lun'
    case 2:
      return 'Mar'
    case 3:
      return 'Mié'
    case 4:
      return 'Jue'
    case 5:
      return 'Vie'
    case 6:
      return 'Sáb'
    case 7:
      return 'Dom'
    default:
      return diaSemana
  }
};

