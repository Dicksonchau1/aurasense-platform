import json, matplotlib.pyplot as plt

def main():
    with open('deck_s5_data.json') as f:
        data = json.load(f)
    m3 = data['m3']
    m4 = data['m4']
    t = list(range(len(m3)))
    fig, ax1 = plt.subplots()
    ax1.plot(t, m3, 'b-', label='M3')
    ax1.set_xlabel('Minute')
    ax1.set_ylabel('M3', color='b')
    ax2 = ax1.twinx()
    ax2.plot(t, m4, 'r-', label='M4')
    ax2.set_ylabel('M4', color='r')
    plt.title('S5 Lifecycle Plot')
    plt.savefig('s5_lifecycle.png')
if __name__ == "__main__":
    main()
