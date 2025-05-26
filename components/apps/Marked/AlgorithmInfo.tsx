import React from 'react';
import styled from 'styled-components';

const InfoContainer = styled.div<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? '#313244' : '#f1f3f5')};
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin: 1rem 0;
  color: ${({ isDarkMode }) => (isDarkMode ? '#cdd6f4' : '#333344')};
`;

const Title = styled.h3<{ isDarkMode: boolean }>`
  color: ${({ isDarkMode }) => (isDarkMode ? '#89b4fa' : '#5c7cfa')};
  margin-bottom: 1rem;
  font-size: 1.25rem;
`;

const Section = styled.div`
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h4<{ isDarkMode: boolean }>`
  color: ${({ isDarkMode }) => (isDarkMode ? '#f5c2e7' : '#be4bdb')};
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const List = styled.ul`
  list-style-type: disc;
  margin-left: 1.5rem;
  margin-bottom: 0.5rem;
`;

const ListItem = styled.li`
  margin-bottom: 0.25rem;
`;

interface AlgorithmInfoProps {
    algorithm: string;
    isDarkMode: boolean;
}

const algorithmData = {
    FCFS: {
        title: 'First-Come, First-Served (FCFS)',
        description: 'FCFS is the simplest scheduling algorithm that executes processes in the order they arrive in the ready queue.',
        advantages: [
            'Simple and easy to implement',
            'Fair in a first-come-first-served manner',
            'No starvation as every process gets chance to execute'
        ],
        disadvantages: [
            'Can lead to convoy effect where short processes wait behind long processes',
            'Not suitable for interactive systems',
            'High average waiting time',
            'No priority consideration'
        ]
    },
    SJF: {
        title: 'Shortest Job First (SJF)',
        description: 'SJF selects the process with the smallest burst time to execute next.',
        advantages: [
            'Optimal average waiting time for a given set of processes',
            'Good for batch systems',
            'Reduces average waiting time compared to FCFS'
        ],
        disadvantages: [
            'May lead to starvation of processes with longer burst times',
            'Difficult to predict burst time accurately',
            'Not suitable for interactive systems',
            'Cannot handle varying burst times effectively'
        ]
    },
    SRTF: {
        title: 'Shortest Remaining Time First (SRTF)',
        description: 'SRTF is the preemptive version of SJF, where the process with the shortest remaining time is always chosen to execute.',
        advantages: [
            'Optimal average waiting time',
            'Good for systems with varying burst times',
            'Responsive to short processes'
        ],
        disadvantages: [
            'High context switching overhead',
            'Can lead to starvation of longer processes',
            'Difficult to predict remaining time accurately',
            'Complex implementation'
        ]
    },
    Priority: {
        title: 'Priority Scheduling',
        description: 'Processes are scheduled based on priority values assigned to them. Higher priority processes are executed first.',
        advantages: [
            'Supports different priority levels',
            'Good for systems with clear priority requirements',
            'Flexible and can be adapted to different needs'
        ],
        disadvantages: [
            'Can lead to starvation of low-priority processes',
            'Priority inversion problem possible',
            'Needs additional mechanism to prevent aging',
            'Overhead in priority management'
        ]
    },
    RR: {
        title: 'Round Robin (RR)',
        description: 'Each process gets a small unit of CPU time (quantum), and after this time has elapsed, the process is preempted and added to the end of the ready queue.',
        advantages: [
            'Fair allocation of CPU time',
            'Good for interactive systems',
            'No starvation',
            'Better response time'
        ],
        disadvantages: [
            'Higher context switching overhead',
            'Performance depends heavily on quantum size',
            'Larger average waiting time than SJF',
            'Not suitable for processes with varying burst times'
        ]
    },
    MLQ: {
        title: 'Multi-Level Queue (MLQ)',
        description: 'Processes are permanently assigned to different queues with different priorities and scheduling algorithms.',
        advantages: [
            'Flexible with different scheduling needs',
            'Good for systems with distinct process types',
            'Can optimize different process categories separately'
        ],
        disadvantages: [
            'Complex implementation',
            'Possible starvation of lower priority queues',
            'Fixed allocation of processes to queues',
            'Needs careful tuning of parameters'
        ]
    },
    MLFQ: {
        title: 'Multi-Level Feedback Queue (MLFQ)',
        description: 'Similar to MLQ, but processes can move between queues based on their behavior and CPU bursts.',
        advantages: [
            'Adaptive to process behavior',
            'Good balance between response time and throughput',
            'Favors short and I/O bound processes',
            'More flexible than MLQ'
        ],
        disadvantages: [
            'Most complex implementation',
            'Overhead in queue management',
            'Needs careful parameter tuning',
            'Can be unpredictable'
        ]
    },
    Lottery: {
        title: 'Lottery Scheduling',
        description: 'Processes are assigned lottery tickets, and the scheduler randomly selects a ticket to determine which process runs next.',
        advantages: [
            'Probabilistically fair',
            'Simple to implement',
            'Flexible priority adjustment',
            'Good load balancing'
        ],
        disadvantages: [
            'Non-deterministic execution',
            'May not be suitable for real-time systems',
            'Possible unfair distribution in short term',
            'Overhead in ticket management'
        ]
    }
};

const AlgorithmInfo: React.FC<AlgorithmInfoProps> = ({ algorithm, isDarkMode }) => {
    const info = algorithmData[algorithm as keyof typeof algorithmData];

    if (!info) return null;

    return (
        <InfoContainer isDarkMode={isDarkMode}>
            <Title isDarkMode={isDarkMode}>{info.title}</Title>
            <Section>
                <p>{info.description}</p>
            </Section>
            <Section>
                <SectionTitle isDarkMode={isDarkMode}>Advantages</SectionTitle>
                <List>
                    {info.advantages.map((advantage, index) => (
                        <ListItem key={index}>{advantage}</ListItem>
                    ))}
                </List>
            </Section>
            <Section>
                <SectionTitle isDarkMode={isDarkMode}>Disadvantages</SectionTitle>
                <List>
                    {info.disadvantages.map((disadvantage, index) => (
                        <ListItem key={index}>{disadvantage}</ListItem>
                    ))}
                </List>
            </Section>
        </InfoContainer>
    );
};

export default AlgorithmInfo; 